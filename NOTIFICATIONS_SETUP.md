# Library Database Notifications Setup Guide

## Overview

This guide explains the complete notification system implementation for your library database. The system includes database triggers, backend API endpoints, and frontend components.

---

## 🗄️ Database Changes

### 1. Notifications Table

A new `notifications` table has been created to store all user notifications:

```sql
CREATE TABLE notifications (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patron_id INT UNSIGNED NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  link_data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
);
```

### 2. Triggers Added

Six automatic triggers have been added to your database:

#### **Trigger 1: `notify_hold_ready`**
- **When**: A hold's status changes to "ready" (2)
- **Action**: Creates a notification telling the patron their hold is ready for pickup
- **Related Fields**: `hold_id`, `item_id`

#### **Trigger 2: `notify_on_return`**
- **When**: An item is returned (loan status changes to 2)
- **Action**: Updates item availability and notifies the next person in the hold queue
- **Related Fields**: `item_id`, `loan_id`

#### **Trigger 3: `notify_fine_created`**
- **When**: A new fine is inserted
- **Action**: Creates a notification showing the fine amount
- **Related Fields**: `fine_id`, `fine_amount`

#### **Trigger 4: `notify_fine_paid`**
- **When**: A fine is marked as paid (paid_date is updated)
- **Action**: Creates a notification confirming the payment
- **Related Fields**: `fine_id`, `paid_amount`

#### **Trigger 5: `notify_overdue`**
- **When**: A loan's due date equals today (for active loans)
- **Action**: Sends a reminder notification
- **Related Fields**: `loan_id`, `item_id`

#### **Trigger 6: `notify_hold_created`**
- **When**: A new hold is placed
- **Action**: Creates a confirmation notification for the patron
- **Related Fields**: `hold_id`, `item_id`

---

## 💻 Backend API Endpoints

All endpoints require user authentication (session). Base URL: `/api/notifications`

### **GET /api/notifications**
Fetch all notifications for the current user

**Query Parameters:**
- `limit` (optional): Number of notifications to fetch (max: 100, default: 20)

**Response:**
```json
[
  {
    "notification_id": 1,
    "notification_type": "HOLD_READY",
    "message": "Your hold is ready for pickup!",
    "is_read": 0,
    "link_data": {"hold_id": 5, "item_id": 12},
    "created_at": "2026-04-14T10:30:00Z"
  }
]
```

### **GET /api/notifications/count**
Get count of unread notifications

**Response:**
```json
{
  "unread_count": 3
}
```

### **PUT /api/notifications/:notificationId**
Mark a specific notification as read

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

### **PUT /api/notifications/read-all**
Mark all notifications as read

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### **DELETE /api/notifications/:notificationId**
Delete a specific notification

**Response:**
```json
{
  "message": "Notification deleted"
}
```

### **DELETE /api/notifications**
Clear all notifications for the current user

**Response:**
```json
{
  "message": "All notifications cleared"
}
```

---

## 🎨 Frontend Components

### **1. useNotifications Hook**

Located at: `react/src/hooks/useNotifications.js`

A custom React hook for managing notifications with automatic polling.

**Usage:**
```jsx
import { useNotifications } from "../hooks/useNotifications.js";

function MyComponent() {
  const {
    notifications,      // Array of notification objects
    unreadCount,       // Number of unread notifications
    isLoading,         // Loading state
    error,             // Error message if any
    fetchNotifications,  // Function to manually fetch notifications
    fetchUnreadCount,    // Function to manually fetch unread count
    markAsRead,        // Function to mark a notification as read
    markAllAsRead,     // Function to mark all as read
    deleteNotification, // Function to delete a notification
    clearAll,          // Function to clear all notifications
  } = useNotifications(30000); // Poll every 30 seconds

  // Use the hook variables and functions...
}
```

**Parameters:**
- `pollInterval` (optional): Milliseconds between automatic polls (default: 30000ms)

### **2. NotificationBell Component**

Located at: `react/src/components/NotificationBellUpdated.jsx`

A full-featured notification bell UI component with dropdown panel.

**Features:**
- Shows unread notification count as a red badge
- Dropdown panel displaying notifications
- Click to mark individual notifications as read
- Delete individual notifications
- Mark all as read button
- Relative time display (e.g., "2m ago")
- Emoji icons for different notification types
- Responsive design for mobile

**Usage:**
```jsx
import NotificationBell from "../components/NotificationBellUpdated.jsx";

function App() {
  return (
    <div className="header">
      <h1>My App</h1>
      <NotificationBell />
    </div>
  );
}
```

**Styling:**
The component uses CSS (located at `react/src/components/NotificationBell.css`). You can customize colors and layout by modifying the CSS variables.

### **3. Notifications API Functions**

Located at: `react/src/api/notifications.js`

Direct API functions if you need more control than the hook provides.

```jsx
import {
  GetNotifications,
  GetUnreadNotificationCount,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
  ClearAllNotifications,
} from "../api/notifications.js";

// Example usage
const notifications = await GetNotifications(20);
const { unread_count } = await GetUnreadNotificationCount();
await MarkNotificationAsRead(123);
```

---

## ⚙️ Installation Steps

### 1. Update Database

Run the updated `library_database.sql` file to add:
- `notifications` table
- All triggers

```bash
mysql -u your_user -p your_database < library_database.sql
```

### 2. Restart Backend

The backend (`backend/app.js`) has been updated with new notification endpoints. Restart your backend server:

```bash
npm start  # or your start command
```

### 3. Add NotificationBell to App

Update your main React component to include the notification bell:

```jsx
// react/src/App.jsx
import { NotificationBell } from "./components/NotificationBellUpdated.jsx";

function App() {
  return (
    <div className="app">
      {/* Your header/navbar */}
      <div className="navbar">
        <h1>Library System</h1>
        <NotificationBell />
      </div>
      
      {/* Rest of your app */}
    </div>
  );
}

export default App;
```

---

## 🔔 Notification Types

The system generates notifications for these events:

| Type | Event | When |
|------|-------|------|
| `HOLD_READY` | Hold is ready | Status changes to "ready" |
| `ITEM_AVAILABLE` | Item returned to queue | Next person in hold queue notified |
| `FINE_CREATED` | New fine generated | Fine inserted in database |
| `FINE_PAID` | Fine paid | Fine marked as paid |
| `LOAN_DUE_SOON` | Due date reminder | Loan due date equals today |
| `HOLD_CREATED` | Hold placed | New hold created |

---

## 🧪 Testing the System

### 1. Test in Database

```sql
-- Create a test notification manually
INSERT INTO notifications (patron_id, notification_type, message, is_read)
VALUES (1, 'TEST', 'This is a test notification', 0);

-- View notifications for patron 1
SELECT * FROM notifications WHERE patron_id = 1 ORDER BY created_at DESC;
```

### 2. Test in Frontend

1. Log in as a patron
2. You should see the notification bell in your header
3. The badge shows unread count
4. Click the bell to open the dropdown
5. Click a notification to mark it as read
6. The unread count should decrease

### 3. Test Triggers

To test triggers, perform library operations:
- Place a hold → `HOLD_CREATED` notification
- Return an item with pending holds → `ITEM_AVAILABLE` notification (for next person)
- Generate a fine (system operation) → `FINE_CREATED` notification
- Mark a fine as paid → `FINE_PAID` notification

---

## 🎯 Customization

### Change Poll Interval

```jsx
// Poll every 60 seconds instead of 30
<useNotifications pollInterval={60000} />
```

### Disable Automatic Polling

```jsx
// Disable polling (pollInterval = 0 or negative)
const { fetchNotifications, unreadCount } = useNotifications(-1);

// Manually fetch when needed
useEffect(() => {
  const handleManual = () => {
    fetchNotifications();
  };
  // Call handleManual() when appropriate
}, []);
```

### Customize Notification Icons

Edit `NotificationBellUpdated.jsx`:

```jsx
const getNotificationIcon = (type) => {
  const icons = {
    HOLD_READY: "🎁",        // Change emoji
    ITEM_AVAILABLE: "🎉",
    FINE_CREATED: "💰",
    FINE_PAID: "✅",
    LOAN_DUE_SOON: "⏳",
    HOLD_CREATED: "🤝",
  };
  return icons[type] || "📬";
};
```

### Customize Styling

Edit `NotificationBell.css` to modify colors, sizes, and animations.

---

## 🐛 Troubleshooting

### Notifications not appearing?

1. **Check triggers exist:**
   ```sql
   SHOW TRIGGERS FROM Library_Database;
   ```

2. **Check notifications table:**
   ```sql
   SELECT * FROM notifications LIMIT 10;
   ```

3. **Check backend logs** for API errors

### Frontend not showing?

1. Verify `NotificationBellUpdated.jsx` is imported correctly
2. Check browser console for JavaScript errors
3. Verify backend is running and accessible
4. Check network tab to see if API calls are successful

### Triggers not firing?

1. Ensure triggers were created without errors:
   ```sql
   SHOW TRIGGERS WHERE Trigger LIKE 'notify%';
   ```

2. Check MySQL error logs
3. Verify the trigger conditions match your operations

---

## 📝 Notes

- Notifications are stored in the database indefinitely (consider archiving old ones if needed)
- The poll interval can be adjusted based on your performance requirements
- All notification endpoints require authentication
- The `link_data` JSON field can be used to pass navigation data to the frontend

---

## 📞 Support

If you encounter issues:

1. Check the trigger code in `library_database.sql`
2. Verify all endpoints are available in the backend
3. Check browser console and backend logs for errors
4. Ensure database migrations were applied successfully

