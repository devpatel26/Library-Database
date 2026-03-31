import React, { useState } from "react";
import PrimaryButton from "../components/Buttons";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatBirthdate, FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

export default function PatronSummaryReport() {
  const [patronIdInput, setPatronIdInput] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {showError, showWarning } = useMessage();

  async function LoadReport() {
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

    if (!patronIdInput) {
      showWarning("Please enter a patron ID.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await FetchJson(
        `/api/reports/patron-summary?patronId=${patronIdInput}`,
      );
      setReportData(data);
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to load report.");
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Report
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Patron Summary
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        Enter a patron ID to view that patron&apos;s holds, loans, and fines.
      </p>

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
            <h2 className="text-2xl font-semibold text-white">
              Patron Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-slate-300 md:grid-cols-2">
              <div>Patron ID: {reportData.patron.patronId}</div>
              <div>
                Name: {reportData.patron.firstName} {reportData.patron.lastName}
              </div>
              <div>Email: {reportData.patron.email}</div>
              <div>Role: {reportData.patron.patronRole}</div>
              <div>
                Status: {reportData.patron.isActive ? "Active" : "Inactive"}
              </div>
              <div>
                Date of Birth:{" "}
                {FormatBirthdate(new Date(reportData.patron.dateOfBirth)) ||
                  "N/A"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-yellow-300">
              Current Holds
            </h2>
            <div className="mt-4 overflow-x-auto">
              {reportData.holds.length === 0 ? (
                <div className="text-slate-300">No current holds found.</div>
              ) : (
                <table className="min-w-full table-fixed border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-4 py-3">Hold ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Creator</th>
                      <th className="px-4 py-3">Hold Date</th>
                      <th className="px-4 py-3">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.holds.map((hold) => (
                      <tr
                        key={hold.holdId}
                        className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                      >
                        <td className="px-4 py-3">{hold.holdId}</td>
                        <td className="px-4 py-3 text-white">{hold.title}</td>
                        <td className="px-4 py-3">{hold.creator || "N/A"}</td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(hold.holdStart))}
                        </td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(hold.holdEnd))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-emerald-300">
              Active Loans
            </h2>
            <div className="mt-4 overflow-x-auto">
              {reportData.activeLoans.length === 0 ? (
                <div className="text-slate-300">No active loans found.</div>
              ) : (
                <table className="min-w-full table-fixed border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-4 py-3">Loan ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Creator</th>
                      <th className="px-4 py-3">Loan Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.activeLoans.map((loan) => (
                      <tr
                        key={loan.loanId}
                        className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                      >
                        <td className="px-4 py-3">{loan.loanId}</td>
                        <td className="px-4 py-3 text-white">{loan.title}</td>
                        <td className="px-4 py-3">{loan.creator || "N/A"}</td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(loan.loanStart))}
                        </td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(loan.loanEnd))}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-300">
                          Active
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-sky-300">
              Completed Loans
            </h2>
            <div className="mt-4 overflow-x-auto">
              {reportData.completedLoans.length === 0 ? (
                <div className="text-slate-300">No completed loans found.</div>
              ) : (
                <table className="min-w-full table-fixed border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-4 py-3">Loan ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Creator</th>
                      <th className="px-4 py-3">Loan Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.completedLoans.map((loan) => (
                      <tr
                        key={loan.loanId}
                        className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                      >
                        <td className="px-4 py-3">{loan.loanId}</td>
                        <td className="px-4 py-3 text-white">{loan.title}</td>
                        <td className="px-4 py-3">{loan.creator || "N/A"}</td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(loan.loanStart))}
                        </td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(loan.loanEnd))}
                        </td>
                        <td className="px-4 py-3 font-semibold text-sky-300">
                          Completed
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 outline outline-1 outline-white/10">
            <h2 className="text-2xl font-semibold text-red-300">Fines</h2>
            <div className="mt-4 overflow-x-auto">
              {reportData.fines.length === 0 ? (
                <div className="text-slate-300">No fines found.</div>
              ) : (
                <table className="min-w-full table-fixed border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-4 py-3">Fine ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Fine Amount</th>
                      <th className="px-4 py-3">Paid Amount</th>
                      <th className="px-4 py-3">Remaining</th>
                      <th className="px-4 py-3">Fine Date</th>
                      <th className="px-4 py-3">Paid Date</th>
                      <th className="px-4 py-3">Waived Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.fines.map((fine) => (
                      <tr
                        key={fine.fineId}
                        className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                      >
                        <td className="px-4 py-3">{fine.fineId}</td>
                        <td className="px-4 py-3 text-white">
                          {fine.title || "No linked title"}
                        </td>
                        <td className="px-4 py-3 text-red-300">
                          ${Number(fine.fineAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          ${Number(fine.paidAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-300">
                          ${Number(fine.remainingAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {FormatDate(new Date(fine.fineDate))}
                        </td>
                        <td className="px-4 py-3">
                          {fine.paidDate || "Not paid"}
                        </td>
                        <td className="px-4 py-3">
                          {fine.waivedDate || "Not waived"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
