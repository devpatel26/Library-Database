import React, { useState } from "react";
import PrimaryButton from "../components/Buttons";
import { FetchJson, ReadStoredJson } from "../api";

export default function PatronSummaryReport() {
  const [patronIdInput, setPatronIdInput] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function LoadReport() {
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

    if (!patronIdInput) {
      alert("Please enter a patron ID.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await FetchJson(`/api/reports/patron-summary?patronId=${patronIdInput}`);
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load report.");
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Report
      </p >
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Patron Summary
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        Enter a patron ID to view that patron&apos;s current holds, loans, and fines.
      </p >

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
        <input
          value={patronIdInput}
          onChange={(e) => setPatronIdInput(e.target.value)}
          placeholder="Enter patron ID"
          className="block w-full max-w-md rounded-md bg-white/5 px-3 py-2 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        />
        <PrimaryButton title="Load Report" onClick={LoadReport} />
      </div>

      {isLoading ? (
        <div className="mt-8 text-slate-300">Loading report...</div>
      ) : null}

      {reportData ? (
        <div className="mt-8 space-y-8">
          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-white">Patron Information</h2>
            <div className="mt-4 space-y-2 text-slate-300">
              <div>Patron ID: {reportData.patron.patronId}</div>
              <div>
                Name: {reportData.patron.firstName} {reportData.patron.lastName}
              </div>
              <div>Email: {reportData.patron.email}</div>
              <div>Role: {reportData.patron.patronRole}</div>
              <div>Status: {reportData.patron.isActive ? "Active" : "Inactive"}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-white">Current Holds</h2>
            <div className="mt-4 space-y-3">
              {reportData.holds.length === 0 ? (
                <div className="text-slate-300">No current holds found.</div>
              ) : (
                reportData.holds.map((hold) => (
                  <div key={hold.holdId} className="rounded-xl bg-slate-950/40 p-4">
                    <div className="text-lg font-semibold text-white">{hold.title}</div>
                    {hold.creator ? (
                      <div className="text-sky-300">{hold.creator}</div>
                    ) : null}
                    <div className="mt-2 text-slate-300">
                      Hold Date: {hold.holdStart}
                    </div>
                    <div className="text-slate-300">
                      Expiration Date: {hold.holdEnd}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-white">Loans</h2>
            <div className="mt-4 space-y-3">
              {reportData.loans.length === 0 ? (
                <div className="text-slate-300">No loans found.</div>
              ) : (
                reportData.loans.map((loan) => (
                  <div key={loan.loanId} className="rounded-xl bg-slate-950/40 p-4">
                    <div className="text-lg font-semibold text-white">{loan.title}</div>
                    {loan.creator ? (
                      <div className="text-sky-300">{loan.creator}</div>
                    ) : null}
                    <div className="mt-2 text-slate-300">
                      Loan Date: {loan.loanStart}
                    </div>
                    <div className="text-slate-300">
                      Due Date: {loan.loanEnd}
                    </div>
                    <div className="text-slate-300">
                      Status Code: {loan.loanStatusCode}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-white">Fines</h2>
            <div className="mt-4 space-y-3">
              {reportData.fines.length === 0 ? (
                <div className="text-slate-300">No fines found.</div>
              ) : (
                reportData.fines.map((fine) => (
                  <div key={fine.fineId} className="rounded-xl bg-slate-950/40 p-4">
                    <div className="text-lg font-semibold text-white">
                      {fine.title || "No linked title"}
                    </div>
                    <div className="mt-2 text-slate-300">
                      Fine Amount: ${Number(fine.fineAmount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-slate-300">
                      Paid Amount: ${Number(fine.paidAmount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-slate-300">
                      Remaining Amount: ${Number(fine.remainingAmount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-slate-300">
                      Fine Date: {fine.fineDate}
                    </div>
                    <div className="text-slate-300">
                      Paid Date: {fine.paidDate || "Not paid"}
                    </div>
                    <div className="text-slate-300">
                      Waived Date: {fine.waivedDate || "Not waived"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}