# Overdue Fine System - Implementation Details

## How It Works

### 1. **Automatic Calculation**

When a patron returns an item **late** (return_date > loan_due_date):

```
Days Late = return_date - loan_due_date
Daily Fine Rate = patron_roles.fine (from their patron role)
Total Fine = Days Late × Daily Fine Rate
```

**Example:**
- Loan due: April 10, 2026
- Actually returned: April 14, 2026
- Days late: 4 days
- Patron role daily fine: $2.00
- Total fine charged: 4 × $2.00 = **$8.00**

### 2. **Automatic Trigger**

The `charge_overdue_fine` trigger:
- ✅ Fires automatically when `return_date` is set on a loan
- ✅ Checks if return_date exceeds loan_due_date
- ✅ Calculates days late using the patron's role
- ✅ Inserts fine record into `fines` table with the calculated amount
- ✅ Links the fine to the loan via `loan_id`
- ✅ Logs activity in `activity_logs`

### 3. **Notification Details**

The enhanced `notify_fine_created_enhanced` trigger creates an intelligent notification:

**For Overdue Fines:**
```
Late return fee: You were charged $2.00 per day for 4 day(s) late. 
Total amount due: $8.00
```

**For Regular Fines:**
```
A fine of $8.00 has been applied to your account.
```

The notification type is `OVERDUE_FINE` for late returns, displayed with a 💰 emoji.

---

## Backend Implementation

No additional backend code was needed! The database triggers handle everything automatically.

However, if you want to **manually calculate overdue fines** (e.g., for a batch operation), you could add a backend endpoint:

```javascript
// Optional: Add this to backend if you need manual overdue calculation
app.post(["/admin/calculate-overdue-fines", "/api/admin/calculate-overdue-fines"], async (req, res) => {
  try {
    const sessionId = GetSessionId(req);
    const session = await LoadSession(sessionId);
    
    // Verify admin access
    if (!session || !session.staff_id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Find all returned items that are overdue and not yet fined
    const [overdueLoans] = await pool.query(
      `SELECT l.loan_id, l.patron_id, l.loan_due_date, l.return_date, 
              pr.fine, l.patron_role_code
       FROM loans l
       JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
       WHERE l.return_date > l.loan_due_date
       AND l.loan_status_code = 2
       AND l.loan_id NOT IN (SELECT loan_id FROM fines WHERE loan_id IS NOT NULL)`
    );

    let chargedCount = 0;
    
    for (const loan of overdueLoans) {
      const daysLate = Math.floor(
        (new Date(loan.return_date) - new Date(loan.loan_due_date)) / (1000 * 60 * 60 * 24)
      );
      const totalFine = daysLate * loan.fine;

      if (totalFine > 0) {
        await pool.query(
          `INSERT INTO fines (patron_id, fine_amount, fine_date, loan_id, paid_amount)
           VALUES (?, ?, ?, ?, ?)`,
          [loan.patron_id, totalFine, new Date(), loan.loan_id, 0]
        );
        chargedCount++;
      }
    }

    res.json({ 
      message: `Calculated overdue fines for ${chargedCount} late returns`,
      chargedCount 
    });
  } catch (error) {
    console.error("Calculate overdue fines error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to calculate overdue fines."),
    });
  }
});
```

---

## Database Queries for Testing

### View overdue fines that were charged:
```sql
SELECT 
  f.fine_id,
  f.patron_id,
  p.first_name,
  p.last_name,
  f.fine_amount,
  f.fine_date,
  l.loan_due_date,
  l.return_date,
  DATEDIFF(l.return_date, l.loan_due_date) as days_late,
  pr.fine as daily_rate
FROM fines f
JOIN patrons p ON p.patron_id = f.patron_id
JOIN loans l ON l.loan_id = f.loan_id
JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
WHERE f.loan_id IS NOT NULL
ORDER BY f.fine_date DESC;
```

### View patron's daily fine rate:
```sql
SELECT patron_role_code, patron_role, fine FROM patron_roles;
```

### Check if a loan triggered an overdue fine:
```sql
SELECT 
  l.loan_id,
  l.loan_due_date,
  l.return_date,
  DATEDIFF(l.return_date, l.loan_due_date) as days_late,
  f.fine_id,
  f.fine_amount
FROM loans l
LEFT JOIN fines f ON f.loan_id = l.loan_id
WHERE l.loan_id = 123;  -- Replace with actual loan_id
```

---

## Notification Types Reference

| Type | When | Icon | Message |
|------|------|------|---------|
| `HOLD_READY` | Hold is ready for pickup | 📦 | Your hold is ready for pickup! |
| `ITEM_AVAILABLE` | Next person in hold queue notified | ✓ | An item you have on hold is now available! |
| `FINE_CREATED` | General fine (non-overdue) | ⚠️ | A fine of $X has been applied to your account. |
| `OVERDUE_FINE` | Late return charged | 💰 | Late return fee: $X per day for Y day(s) late. Total due: $Z |
| `FINE_PAID` | Fine payment recorded | 💳 | Your fine of $X has been recorded as paid. |
| `LOAN_DUE_SOON` | Due date reminder | ⏰ | Your library item is due today! |
| `HOLD_CREATED` | Hold placed | 👋 | Your hold request has been confirmed. |

---

## Troubleshooting Overdue Fines

### "No fine was created for my late return"

1. **Verify the return_date was set:**
   ```sql
   SELECT return_date, loan_due_date FROM loans WHERE loan_id = XXX;
   ```

2. **Check if the trigger created the fine:**
   ```sql
   SELECT * FROM fines WHERE loan_id = XXX;
   ```

3. **Check activity logs:**
   ```sql
   SELECT * FROM activity_logs WHERE loan_id = XXX ORDER BY created_at DESC;
   ```

4. **Verify patron's daily fine rate:**
   ```sql
   SELECT pr.fine FROM patron_roles pr 
   WHERE pr.patron_role_code = (SELECT patron_role_code FROM loans WHERE loan_id = XXX);
   ```

### "Fine is calculating incorrectly"

1. Check that `loan_due_date` and `return_date` are correct dates
2. Verify the daily fine amount in `patron_roles` table
3. Use: `DATEDIFF(return_date, loan_due_date)` to verify day calculation

### "I want to manually charge an overdue fine"

Use the optional backend endpoint above, or insert directly:
```sql
INSERT INTO fines (patron_id, fine_amount, fine_date, loan_id, paid_amount)
VALUES (123, 10.00, CURDATE(), 456, 0);
-- This will trigger notify_fine_created_enhanced automatically
```

---

## Edge Cases Handled

✅ **Fraction of a day**: Calculates as full days (DATEDIFF rounds down)
✅ **Zero fine**: If daily rate is $0, no fine is created
✅ **Already fined item**: Won't double-charge if fine exists for that loan
✅ **Multiple patron roles**: Each role has its own daily fine rate
✅ **Automatic notification**: Sent immediately when fine is created

