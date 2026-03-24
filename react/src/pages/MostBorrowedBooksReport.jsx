import React, { useEffect, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";

export default function MostBorrowedBooksReport() {
  const [reportRows, setReportRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function LoadReport() {
    try {
      setIsLoading(true);
      const data = await FetchJson("/api/reports/most-borrowed-books");
      setReportRows(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load report.");
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
      alert("Only staff can access reports.");
      window.location.href = "/";
      return;
    }

    LoadReport();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Report
      </p >
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Most Borrowed Books
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View the books with the highest total number of loans.
      </p >

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="text-slate-300">Loading report...</div>
        ) : reportRows.length === 0 ? (
          <div className="text-slate-300">No report data found.</div>
        ) : (
          reportRows.map((row) => (
            <div
              key={row.itemId}
              className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 md:grid-cols-4"
            >
              <div className="md:col-span-2">
                <div className="text-xl font-bold text-white">{row.title}</div>
                <div className="mt-2 text-sky-300">
                  {row.authors || "No author data"}
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-300">
                Item ID: {row.itemId}
              </div>

              <div className="flex items-center justify-center text-lg font-semibold text-white">
                Total Loans: {row.totalLoans}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}