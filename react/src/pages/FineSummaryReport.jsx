import React, { useEffect, useMemo, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";

function FormatMoney(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function SafeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function SafeText(value) {
  return value == null ? "" : String(value);
}

function NormalizeStatus(status) {
  const text = SafeText(status).trim().toLowerCase();

  if (text === "returned but unpaid") {
    return "Returned but unpaid";
  }

  if (text === "paid") {
    return "Paid";
  }

  if (text === "waived") {
    return "Waived";
  }

  return "Overdue";
}

function ParseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function MatchesDateRange(fine, startDate, endDate) {
  const dueDate = ParseDateValue(fine.loanDueDate);

  if (!dueDate) {
    return true;
  }

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (dueDate < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`);
    if (dueDate > end) {
      return false;
    }
  }

  return true;
}

function BuildSortValue(fine, sortBy) {
  switch (sortBy) {
    case "fineId":
      return SafeNumber(fine.fineId);
    case "patronName":
      return SafeText(fine.patronName).toLowerCase();
    case "title":
      return SafeText(fine.title).toLowerCase();
    case "daysOverdue":
      return SafeNumber(fine.daysOverdue);
    case "dailyFine":
      return SafeNumber(fine.dailyFine);
    case "fineAmount":
      return SafeNumber(fine.fineAmount);
    case "paidAmount":
      return SafeNumber(fine.paidAmount);
    case "remainingAmount":
      return SafeNumber(fine.remainingAmount);
    case "fineStatus":
      return NormalizeStatus(fine.fineStatus).toLowerCase();
    case "loanDueDate": {
      const date = ParseDateValue(fine.loanDueDate);
      return date ? date.getTime() : 0;
    }
    default:
      return SafeNumber(fine.fineId);
  }
}

function StatusCard({ title, count, amount, colorClasses }) {
  return (
    <div className={`rounded-2xl border p-4 ${colorClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em]">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{count}</p>
      <p className="mt-2 text-sm opacity-90">{FormatMoney(amount)}</p>
    </div>
  );
}

export default function FineSummaryReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [minDaysOverdue, setMinDaysOverdue] = useState("");
  const [sortBy, setSortBy] = useState("remainingAmount");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const user = ReadStoredJson("user");

    if (!user) {
      showWarning("Please log in first.");

      const timeoutId = setTimeout(() => {
        window.location.href = "/login";
      }, 1200);

      return () => clearTimeout(timeoutId);
    }

    const roleCode = Number(
    user.role ??
    user.role_code ??
    user.staff_role_code ??
    user.staffRoleCode
    );

    if (user.user_type !== "staff" || roleCode !== 2) {
    showError("Only admin can access the fine summary report.");

    setTimeout(() => {
        window.location.href = "/report";
    }, 3000);

    return;
    }

    let isMounted = true;

    async function LoadReport() {
      try {
        setIsLoading(true);
        const data = await FetchJson("/api/staff/fines/current");

        if (isMounted) {
          setFines(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load fine summary report.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    LoadReport();

    return () => {
      isMounted = false;
    };
  }, [showError, showWarning]);

  const filteredFines = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const minDays = minDaysOverdue === "" ? null : Number(minDaysOverdue);

    const result = fines.filter((fine) => {
      const normalizedStatus = NormalizeStatus(fine.fineStatus);

      if (statusFilter !== "All" && normalizedStatus !== statusFilter) {
        return false;
      }

      if (!MatchesDateRange(fine, startDate, endDate)) {
        return false;
      }

      if (Number.isFinite(minDays) && minDays >= 0) {
        if (SafeNumber(fine.daysOverdue) < minDays) {
          return false;
        }
      }

      if (normalizedSearch) {
        const haystack = [
          fine.fineId,
          fine.title,
          fine.creator,
          fine.patronName,
          fine.patronId,
          fine.fineStatus,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });

    result.sort((left, right) => {
      const leftValue = BuildSortValue(left, sortBy);
      const rightValue = BuildSortValue(right, sortBy);

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [
    fines,
    startDate,
    endDate,
    statusFilter,
    searchText,
    minDaysOverdue,
    sortBy,
    sortDirection,
  ]);

  const summary = useMemo(() => {
    const totalFineRecords = filteredFines.length;
    const totalFineAmount = filteredFines.reduce(
      (sum, fine) => sum + SafeNumber(fine.fineAmount),
      0
    );
    const totalPaidAmount = filteredFines.reduce(
      (sum, fine) => sum + SafeNumber(fine.paidAmount),
      0
    );
    const totalRemainingAmount = filteredFines.reduce(
      (sum, fine) => sum + SafeNumber(fine.remainingAmount),
      0
    );
    const averageFineAmount =
      totalFineRecords > 0 ? totalFineAmount / totalFineRecords : 0;
    const averageDaysOverdue =
      totalFineRecords > 0
        ? filteredFines.reduce(
            (sum, fine) => sum + SafeNumber(fine.daysOverdue),
            0
          ) / totalFineRecords
        : 0;

    return {
      totalFineRecords,
      totalFineAmount,
      totalPaidAmount,
      totalRemainingAmount,
      averageFineAmount,
      averageDaysOverdue,
    };
  }, [filteredFines]);

  const statusBreakdown = useMemo(() => {
    const initial = {
      Overdue: { count: 0, amount: 0 },
      "Returned but unpaid": { count: 0, amount: 0 },
      Paid: { count: 0, amount: 0 },
      Waived: { count: 0, amount: 0 },
    };

    filteredFines.forEach((fine) => {
      const status = NormalizeStatus(fine.fineStatus);
      initial[status].count += 1;
      initial[status].amount += SafeNumber(fine.fineAmount);
    });

    return initial;
  }, [filteredFines]);

  const topPatrons = useMemo(() => {
    const map = new Map();

    filteredFines.forEach((fine) => {
      const patronId = SafeText(fine.patronId);
      const patronName = SafeText(fine.patronName) || "Unknown Patron";
      const key = `${patronId}|${patronName}`;

      if (!map.has(key)) {
        map.set(key, {
          patronId,
          patronName,
          fineCount: 0,
          outstandingBalance: 0,
          totalFineAmount: 0,
        });
      }

      const current = map.get(key);
      current.fineCount += 1;
      current.outstandingBalance += SafeNumber(fine.remainingAmount);
      current.totalFineAmount += SafeNumber(fine.fineAmount);
    });

    return Array.from(map.values())
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
      .slice(0, 5);
  }, [filteredFines]);

  function ResetFilters() {
    setStartDate("");
    setEndDate("");
    setStatusFilter("All");
    setSearchText("");
    setMinDaysOverdue("");
    setSortBy("remainingAmount");
    setSortDirection("desc");
    showInfo("Fine summary filters reset.");
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin Report
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fine Summary Report
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Review fine totals, remaining balances, status breakdowns, top patrons
        by outstanding balance, and detailed fine records with flexible filters.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            >
              <option>All</option>
              <option>Overdue</option>
              <option>Returned but unpaid</option>
              <option>Paid</option>
              <option>Waived</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Min Days Overdue
            </label>
            <input
              type="number"
              min="0"
              value={minDaysOverdue}
              onChange={(event) => setMinDaysOverdue(event.target.value)}
              placeholder="e.g. 7"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            />
          </div>

          <div className="xl:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Search By
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Fine ID, patron name, patron ID, title, creator..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            >
              <option value="remainingAmount">Remaining Amount</option>
              <option value="fineAmount">Total Fine</option>
              <option value="paidAmount">Paid Amount</option>
              <option value="daysOverdue">Days Overdue</option>
              <option value="patronName">Patron Name</option>
              <option value="title">Title</option>
              <option value="fineStatus">Status</option>
              <option value="loanDueDate">Due Date</option>
              <option value="fineId">Fine ID</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Sort Direction
            </label>
            <select
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-slate-300">Loading fine summary report...</div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Total Fine Records
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {summary.totalFineRecords}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Total Fine Amount
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {FormatMoney(summary.totalFineAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Total Paid Amount
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {FormatMoney(summary.totalPaidAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Total Remaining Amount
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {FormatMoney(summary.totalRemainingAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Average Fine Amount
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {FormatMoney(summary.averageFineAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Average Days Overdue
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {summary.averageDaysOverdue.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white">Status Breakdown</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                title="Overdue"
                count={statusBreakdown.Overdue.count}
                amount={statusBreakdown.Overdue.amount}
                colorClasses="border-red-400/20 bg-red-500/10 text-red-200"
              />

              <StatusCard
                title="Returned but unpaid"
                count={statusBreakdown["Returned but unpaid"].count}
                amount={statusBreakdown["Returned but unpaid"].amount}
                colorClasses="border-yellow-400/20 bg-yellow-500/10 text-yellow-200"
              />

              <StatusCard
                title="Paid"
                count={statusBreakdown.Paid.count}
                amount={statusBreakdown.Paid.amount}
                colorClasses="border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              />

              <StatusCard
                title="Waived"
                count={statusBreakdown.Waived.count}
                amount={statusBreakdown.Waived.amount}
                colorClasses="border-sky-400/20 bg-sky-500/10 text-sky-200"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h2 className="text-xl font-semibold text-white">
                Top Patrons by Outstanding Balance
              </h2>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-300">
                      <th className="px-3 py-2">Patron</th>
                      <th className="px-3 py-2">Patron ID</th>
                      <th className="px-3 py-2">Fine Records</th>
                      <th className="px-3 py-2">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPatrons.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-slate-400">
                          No patron fine data found.
                        </td>
                      </tr>
                    ) : (
                      topPatrons.map((patron) => (
                        <tr key={`${patron.patronId}-${patron.patronName}`} className="border-b border-white/5 text-slate-200">
                          <td className="px-3 py-3">{patron.patronName}</td>
                          <td className="px-3 py-3">{patron.patronId}</td>
                          <td className="px-3 py-3">{patron.fineCount}</td>
                          <td className="px-3 py-3 font-semibold text-white">
                            {FormatMoney(patron.outstandingBalance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h2 className="text-xl font-semibold text-white">Quick Notes</h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Use date filters to review fine activity during a specific period.</li>
                <li>Use status filter to isolate overdue, paid, waived, or returned-but-unpaid records.</li>
                <li>Use search to find fines by patron name, patron ID, item title, creator, or fine ID.</li>
                <li>Use minimum overdue days to quickly focus on the most serious late returns.</li>
                <li>Sort by remaining amount to identify the highest outstanding balances first.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-xl font-semibold text-white">
              Fine Detail Table
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-300">
                    <th className="px-3 py-2">Fine ID</th>
                    <th className="px-3 py-2">Patron</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Creator</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Days Overdue</th>
                    <th className="px-3 py-2">Total Fine</th>
                    <th className="px-3 py-2">Paid</th>
                    <th className="px-3 py-2">Remaining</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFines.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-5 text-slate-400">
                        No fine records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFines.map((fine) => (
                      <tr key={fine.fineId} className="border-b border-white/5 text-slate-200">
                        <td className="px-3 py-3">{fine.fineId}</td>

                        <td className="px-3 py-3">
                          {fine.patronName} ({fine.patronId})
                        </td>

                        <td className="px-3 py-3">{fine.title}</td>

                        <td className="px-3 py-3">{fine.creator || "-"}</td>

                        <td className="px-3 py-3">
                          {fine.loanDueDate
                            ? FormatDate(new Date(fine.loanDueDate), true)
                            : "-"}
                        </td>

                        <td className="px-3 py-3">{SafeNumber(fine.daysOverdue)}</td>

                        <td className="px-3 py-3 text-red-300">
                          {FormatMoney(fine.fineAmount)}
                        </td>

                        <td className="px-3 py-3">
                          {FormatMoney(fine.paidAmount)}
                        </td>

                        <td className="px-3 py-3 font-semibold text-white">
                          {FormatMoney(fine.remainingAmount)}
                        </td>

                        <td
                          className={`px-3 py-3 font-semibold ${
                            NormalizeStatus(fine.fineStatus) === "Overdue"
                              ? "text-red-300"
                              : NormalizeStatus(fine.fineStatus) === "Returned but unpaid"
                              ? "text-yellow-300"
                              : NormalizeStatus(fine.fineStatus) === "Paid"
                              ? "text-emerald-300"
                              : "text-sky-300"
                          }`}
                        >
                          {NormalizeStatus(fine.fineStatus)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}