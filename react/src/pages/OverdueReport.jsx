import React, { useEffect, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

export default function OverdueReport() {
  const [reportRows, setReportRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {showError, showWarning } = useMessage();

  useEffect(() => {
    async function LoadReport() {
      try {
        setIsLoading(true);
        const data = await FetchJson("/api/reports/overdue-items");
        setReportRows(data);
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load report.");
      } finally {
        setIsLoading(false);
      }
    }

    const user = ReadStoredJson("user");

    if (!user) {
      showWarning("Please log in first.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    if (user.user_type !== "staff") {
      showWarning("Only staff can access reports.");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
      return;
    }

    LoadReport();
  }, [ showError, showWarning ]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Report
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Overdue Report
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View all currently overdue items, the responsible patron, and the
        current fine amount.
      </p>

      <div className="mt-8 overflow-x-auto">
        {isLoading ? (
          <div className="text-slate-300">Loading report...</div>
        ) : reportRows.length === 0 ? (
          <div className="text-slate-300">No overdue items found.</div>
        ) : (
          <table className="min-w-full border-collapse overflow-hidden rounded-xl">
            <thead>
              <tr className="bg-slate-800 text-left text-sm text-slate-200">
                <th className="px-4 py-3">Loan ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Patron</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Days Overdue</th>
                <th className="px-4 py-3">Daily Fine</th>
                <th className="px-4 py-3">Current Fine</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr
                  key={row.loanId}
                  className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                >
                  <td className="px-4 py-3">{row.loanId}</td>
                  <td className="px-4 py-3 text-white">{row.title}</td>
                  <td className="px-4 py-3">{row.creator || "N/A"}</td>
                  <td className="px-4 py-3">
                    {row.patronName} ({row.patronId})
                  </td>
                  <td className="px-4 py-3">
                    {FormatDate(new Date(row.loanDueDate))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-red-300">
                    {row.daysOverdue}
                  </td>
                  <td className="px-4 py-3">
                    ${Number(row.dailyFine ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-red-300">
                    ${Number(row.currentFine ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
