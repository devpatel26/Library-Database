import Fine from "../components/Fine";
import { useEffect, useState } from "react";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingFineId, setPendingFineId] = useState(null);
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";

  async function LoadFines(currentUser = ReadStoredUser()) {
    if (!currentUser) {
      setFines([]);
      setError("Please log in to view fines.");
      setLoading(false);
      return;
    }

    if (currentUser.user_type !== "patron") {
      setFines([]);
      setError("Fines are currently only available for patron accounts.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await FetchJson("/api/fines");

      setFines(data ?? []);
    } catch (err) {
      setError(GetErrorMessage(err, "Failed to load fines."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    LoadFines(ReadStoredUser());
  }, [userKey]);

  async function PayFine(fineId, remainingAmount) {
    if (Number(remainingAmount) <= 0) {
      alert("This fine has already been fully paid.");
      return;
    }

    const amountInput = window.prompt(
      `Enter payment amount (max $${Number(remainingAmount).toFixed(2)}):`,
    );

    if (!amountInput) {
      return;
    }

    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      setError("");
      setPendingFineId(fineId);
      await FetchJson(`/api/fines/${fineId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      alert("Fine payment recorded successfully!");
      await LoadFines(ReadStoredUser());
    } catch (err) {
      setError(GetErrorMessage(err, "Failed to pay fine."));
    } finally {
      setPendingFineId(null);
    }
  }

  const openFines = fines.filter(
    (fine) => !["Paid", "Waived"].includes(fine.fineStatus),
  );
  const outstandingBalance = openFines.reduce(
    (sum, fine) => sum + Number(fine.remainingAmount ?? 0),
    0,
  );
  const totalPaid = fines.reduce(
    (sum, fine) => sum + Number(fine.paidAmount ?? 0),
    0,
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Fines
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Patron Fines
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Review your balances, see overdue details, and pay fines from your account.
      </p>

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
              Open Balance
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ${outstandingBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
              Paid So Far
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
              Fine Records
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {fines.length}
            </p>
          </div>
        </div>
      ) : null}

      {loading && <p className="mt-4 text-slate-300">Loading fines...</p>}
      {!loading && error && <p className="mt-4 text-rose-300">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 flex flex-wrap gap-4">
          {fines.length === 0 ? (
            <p className="text-slate-300">
              No fines found.
            </p>
          ) : (
            fines.map((item) => (
              <Fine
                key={item.fineId}
                data={item}
                onPay={PayFine}
                payPending={pendingFineId === item.fineId}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
