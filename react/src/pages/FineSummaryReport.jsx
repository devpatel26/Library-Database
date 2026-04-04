
import React, { useEffect, useMemo, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import PrimaryButton from "../components/Buttons";
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
    case "loanDueDate":
      return ParseDateValue(fine.loanDueDate)?.getTime() ?? 0;
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

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function FormatDateLabel(value) {
  if (!value) {
    return "Any time";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function FineSummaryReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [searchBy, setSearchBy] = useState("All");
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

      const timeoutId = setTimeout(() => {
        window.location.href = "/report";
      }, 1200);

      return () => clearTimeout(timeoutId);
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
        const byAll = [
          fine.fineId,
          fine.patronName,
          fine.patronId,
          fine.title,
          fine.creator,
          fine.fineStatus,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byName = SafeText(fine.patronName).toLowerCase();
        const byId = `${SafeText(fine.patronId)} ${SafeText(fine.fineId)}`.toLowerCase();
        const byBookName = SafeText(fine.title).toLowerCase();
        const byCreator = SafeText(fine.creator).toLowerCase();
        const byStatus = NormalizeStatus(fine.fineStatus).toLowerCase();

        if (searchBy === "All" && !byAll.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Name" && !byName.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "ID" && !byId.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Book Name" && !byBookName.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Creator" && !byCreator.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Status" && !byStatus.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Fine ID" && !SafeText(fine.fineId).toLowerCase().includes(normalizedSearch)) {
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
    searchBy,
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

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) {
      return "Showing data for all available dates.";
    }

    if (startDate && endDate) {
      return `Showing data from ${FormatDateLabel(startDate)} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing data from ${FormatDateLabel(startDate)} onward.`;
    }

    return `Showing data up to ${FormatDateLabel(endDate)}.`;
  }, [startDate, endDate]);

  function ResetFilters() {
    setStartDate("");
    setEndDate("");
    setStatusFilter("All");
    setSearchBy("All");
    setSearchText("");
    setMinDaysOverdue("");
    setSortBy("remainingAmount");
    setSortDirection("desc");
    showInfo("Fine summary filters reset.");
  }

  return (
    <section className="flex w-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin Report
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fine Summary Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-300">
        Note: All dates in this report refer to the date the fine was generated (the day the item became overdue).
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Review fine totals, remaining balances, status breakdowns, and detailed
        fine records with flexible filters.
      </p>

      {isLoading ? (
        <div className="mt-8 text-slate-300">
          Loading fine summary report...
        </div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-300">
              {dateRangeLabel}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Fine Records"
              value={summary.totalFineRecords}
            />
            <SummaryCard
              title="Total Fine Amount"
              value={FormatMoney(summary.totalFineAmount)}
            />
            <SummaryCard
              title="Total Paid Amount"
              value={FormatMoney(summary.totalPaidAmount)}
            />
            <SummaryCard
              title="Total Remaining Amount"
              value={FormatMoney(summary.totalRemainingAmount)}
            />
            <SummaryCard
              title="Average Fine Amount"
              value={FormatMoney(summary.averageFineAmount)}
            />
            <SummaryCard
              title="Average Days Overdue"
              value={summary.averageDaysOverdue.toFixed(1)}
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Status Breakdown
              </h2>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-300">
              {dateRangeLabel}
            </p>

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

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-xl font-semibold text-white">
              Search / Filter / Sort
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  Filter By Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Overdue
                  </option>
                  <option>
                    Returned but unpaid
                  </option>
                  <option>
                    Paid
                  </option>
                  <option>
                    Waived
                  </option>
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

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Search By
                </label>
                <select
                  value={searchBy}
                  onChange={(event) => setSearchBy(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Name
                  </option>
                  <option>
                    ID
                  </option>
                  <option>
                    Book Name
                  </option>
                  <option>
                    Creator
                  </option>
                  <option>
                    Status
                  </option>
                  <option>
                    Fine ID
                  </option>
                </select>
              </div>

              <div className="xl:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Search Text
                </label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Enter search value..."
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
                  <option value="remainingAmount">
                    Remaining Amount
                  </option>
                  <option value="fineAmount">
                    Total Fine
                  </option>
                  <option value="paidAmount">
                    Paid Amount
                  </option>
                  <option value="daysOverdue">
                    Days Overdue
                  </option>
                  <option value="patronName">
                    Patron Name
                  </option>
                  <option value="title">
                    Book Name
                  </option>
                  <option value="loanDueDate">
                    Due Date
                  </option>
                  <option value="fineStatus">
                    Status
                  </option>
                  <option value="fineId">
                    Fine ID
                  </option>
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
                  <option value="desc">
                    Descending
                  </option>
                  <option value="asc">
                    Ascending
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
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
                    <th className="px-3 py-2">
                      Fine ID
                    </th>
                    <th className="px-3 py-2">
                      Patron
                    </th>
                    <th className="px-3 py-2">
                      Book Name
                    </th>
                    <th className="px-3 py-2">
                      Creator
                    </th>
                    <th className="px-3 py-2">
                      Due Date
                    </th>
                    <th className="px-3 py-2">
                      Days Overdue
                    </th>
                    <th className="px-3 py-2">
                      Total Fine
                    </th>
                    <th className="px-3 py-2">
                      Paid
                    </th>
                    <th className="px-3 py-2">
                      Remaining
                    </th>
                    <th className="px-3 py-2">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFines.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-5 text-slate-400">
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
                          className={`px-3 py-3 font-semibold ${NormalizeStatus(fine.fineStatus) === "Overdue"
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
