import React, { useEffect, useState } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatTime, FormatDate } from "../components/TimeFormats";

function GetStatusColorClass(fineStatus) {
  if (fineStatus === "Overdue") {
    return "text-red-300";
  }

  if (fineStatus === "Returned but unpaid") {
    return "text-yellow-300";
  }

  if (fineStatus === "Paid") {
    return "text-emerald-300";
  }

  if (fineStatus === "Waived") {
    return "text-sky-300";
  }

  return "text-slate-300";
}

export default function StaffFines() {
  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function LoadFines() {
    try {
      setIsLoading(true);
      const data = await FetchJson("/api/staff/fines/current");
      setFines(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load fines.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const user = ReadStoredJson("user");

    if (!user) {
      alert("Please log in first.");
      window.location.href = "/login";
      return;
    }

    if (user.user_type !== "staff") {
      alert("Only staff can access the staff fines page.");
      window.location.href = "/";
      return;
    }

    LoadFines();
  }, []);

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
      await FetchJson(`/api/fines/${fineId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      alert("Fine payment recorded successfully!");
      await LoadFines();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to pay fine.");
    }
  }

  async function WaiveFine(fineId) {
    try {
      await FetchJson(`/api/fines/${fineId}/waive`, {
        method: "POST",
      });

      alert("Fine waived successfully!");
      await LoadFines();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to waive fine.");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fines
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View all fines and manage overdue, unpaid, paid, and waived balances.
      </p>

      <div className="mt-8 ">
        {isLoading ? (
          <div className="text-slate-300">Loading fines...</div>
        ) : fines.length === 0 ? (
          <div className="text-slate-300">No fines found.</div>
        ) : (
          <table className="min-w-full border-collapse overflow-hidden rounded-xl">
            <thead>
              <tr className="bg-slate-800 text-left text-sm text-slate-200">
                <th className="px-4 py-3">Fine ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Patron</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Days Overdue</th>
                <th className="px-4 py-3">Daily Fine</th>
                <th className="px-4 py-3">Total Fine</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => {
                const isPaid = fine.fineStatus === "Paid";
                const isWaived = fine.fineStatus === "Waived";

                return (
                  <tr
                    key={fine.fineId}
                    className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                  >
                    <td className="px-4 py-3">{fine.fineId}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">
                        {fine.title}
                      </div>
                      {fine.creator ? (
                        <div className="text-sm text-sky-300">
                          {fine.creator}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {fine.patronName} ({fine.patronId})
                    </td>
                    <td className="px-4 py-3">
                      {FormatDate(new Date(fine.loanDueDate), true)}
                    </td>
                    <td className="px-4 py-3">{fine.daysOverdue}</td>
                    <td className="px-4 py-3">
                      ${Number(fine.dailyFine ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-red-300">
                      ${Number(fine.fineAmount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      ${Number(fine.paidAmount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${Number(fine.remainingAmount ?? 0).toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${GetStatusColorClass(fine.fineStatus)}`}
                    >
                      {fine.fineStatus}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <PrimaryButton
                          title="Pay Fine"
                          disabledValue={isPaid || isWaived}
                          onClick={() =>
                            PayFine(fine.fineId, fine.remainingAmount)
                          }
                        />
                        <SecondaryButton
                          title="Waive Fine"
                          disabled={isPaid || isWaived}
                          onClick={() => WaiveFine(fine.fineId)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
