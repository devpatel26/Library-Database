import React, { useEffect, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";

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

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p >
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Current Fines
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View all current overdue fines across active loans.
      </p >

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-slate-300">Loading fines...</div>
        ) : fines.length === 0 ? (
          <div className="text-slate-300">No current fines found.</div>
        ) : (
          fines.map((fine) => (
            <div
              key={fine.loanId}
              className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 md:grid-cols-5"
            >
              <div className="md:col-span-2">
                <div className="text-xl font-bold text-white">{fine.title}</div>
                {fine.creator ? (
                  <div className="text-sky-300">{fine.creator}</div>
                ) : null}
                <div className="mt-2 text-slate-300">
                  Patron: {fine.patronName} (Patron ID: {fine.patronId})
                </div>
              </div>

              <div className="text-slate-300">
                <div>Due date: {fine.loanDueDate}</div>
                <div>Days overdue: {fine.daysOverdue}</div>
              </div>

              <div className="text-slate-300">
                <div>Daily fine: ${Number(fine.dailyFine).toFixed(2)}</div>
                <div className="font-semibold text-red-300">
                  Current fine: ${Number(fine.currentFine).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}