import React, { useEffect, useMemo, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";

function SafeText(value) {
  return value == null ? "" : String(value);
}

function SafeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function FormatMoney(value) {
  return `$${SafeNumber(value).toFixed(2)}`;
}

function NormalizeCategory(category) {
  const text = SafeText(category).trim().toLowerCase();

  if (text === "book" || text === "books") {
    return "Book";
  }

  if (text === "periodical" || text === "periodicals") {
    return "Periodical";
  }

  if (
    text === "audiovisual media" ||
    text === "audiovisualmedia" ||
    text === "audiovisual"
  ) {
    return "Audiovisual Media";
  }

  if (text === "equipment") {
    return "Equipment";
  }

  return "Other";
}

function ParseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function FormatDateLabel(value) {
  if (!value) {
    return "Any time";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function GetCurrentMonthDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${day}`,
  };
}

function SummaryCard({ title, value, subtitle = "" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function BuildSortValue(row, sortBy) {
  switch (sortBy) {
    case "loanId":
      return SafeNumber(row.loanId);
    case "itemId":
      return SafeNumber(row.itemId);
    case "patronId":
      return SafeNumber(row.patronId);
    case "title":
      return SafeText(row.title).toLowerCase();
    case "patronName":
      return SafeText(row.patronName).toLowerCase();
    case "category":
      return NormalizeCategory(row.category).toLowerCase();
    case "loanStartDate":
      return ParseDateValue(row.loanStartDate)?.getTime() ?? 0;
    case "loanDueDate":
      return ParseDateValue(row.loanDueDate)?.getTime() ?? 0;
    case "daysOverdue":
      return SafeNumber(row.daysOverdue);
    case "dailyFine":
      return SafeNumber(row.dailyFine);
    case "currentFine":
      return SafeNumber(row.currentFine);
    default:
      return SafeNumber(row.daysOverdue);
  }
}

function BuildReturnUrl(loanId) {
  return `/api/loans/${loanId}/return`;
}

function BuildMarkLostUrl(loanId) {
  return `/api/loans/${loanId}/mark-lost`;
}

export default function OverdueReport() {
  const { showError, showWarning, showSuccess, showInfo } = useMessage();

  const defaultDateRange = GetCurrentMonthDateRange();

  const [reportRows, setReportRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minDaysOverdue, setMinDaysOverdue] = useState("");

  const [searchBy, setSearchBy] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [sortBy, setSortBy] = useState("daysOverdue");
  const [sortDirection, setSortDirection] = useState("desc");

  const [returnPendingLoanId, setReturnPendingLoanId] = useState(null);
  const [lostPendingLoanId, setLostPendingLoanId] = useState(null);

  useEffect(() => {
    const user = ReadStoredJson("user");

    if (!user) {
      showWarning("Please log in first.");
      const timeoutId = setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return () => clearTimeout(timeoutId);
    }

    if (user.user_type !== "staff") {
      showWarning("Only staff can access reports.");
      const timeoutId = setTimeout(() => {
        window.location.href = "/";
      }, 1200);
      return () => clearTimeout(timeoutId);
    }

    let isMounted = true;

    async function LoadReport() {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();

        if (startDate) {
          params.set("startDate", startDate);
        }

        if (endDate) {
          params.set("endDate", endDate);
        }

        const queryString = params.toString();
        const url = queryString
          ? `/api/reports/overdue-items?${queryString}`
          : "/api/reports/overdue-items";

        const data = await FetchJson(url);

        if (isMounted) {
          setReportRows(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load operations report.");
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
  }, [startDate, endDate, showError, showWarning]);

  async function ReloadReport() {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();

      if (startDate) {
        params.set("startDate", startDate);
      }

      if (endDate) {
        params.set("endDate", endDate);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/api/reports/overdue-items?${queryString}`
        : "/api/reports/overdue-items";

      const data = await FetchJson(url);
      setReportRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to reload operations report.");
    } finally {
      setIsLoading(false);
    }
  }

  async function HandleReturn(loanId) {
    try {
      setReturnPendingLoanId(loanId);

      await FetchJson(BuildReturnUrl(loanId), {
        method: "POST",
      });

      showSuccess("Item returned successfully.");
      await ReloadReport();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to return item.");
    } finally {
      setReturnPendingLoanId(null);
    }
  }

  async function HandleMarkAsLost(loanId) {
    try {
      setLostPendingLoanId(loanId);

      await FetchJson(BuildMarkLostUrl(loanId), {
        method: "POST",
      });

      showSuccess("Loan marked as lost successfully.");
      await ReloadReport();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to mark loan as lost.");
    } finally {
      setLostPendingLoanId(null);
    }
  }

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const minDays = minDaysOverdue === "" ? null : Number(minDaysOverdue);

    const result = reportRows.filter((row) => {
      const normalizedCategory = NormalizeCategory(row.category);

      if (categoryFilter !== "All" && normalizedCategory !== categoryFilter) {
        return false;
      }

      if (Number.isFinite(minDays) && minDays >= 0) {
        if (SafeNumber(row.daysOverdue) < minDays) {
          return false;
        }
      }

      if (normalizedSearch) {
        const byAll = [
          row.loanId,
          row.itemId,
          row.patronId,
          row.title,
          row.patronName,
          row.category,
          row.creator,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byPatronName = SafeText(row.patronName).toLowerCase();
        const byPatronId = SafeText(row.patronId).toLowerCase();
        const byItemTitle = SafeText(row.title).toLowerCase();
        const byItemId = SafeText(row.itemId).toLowerCase();
        const byCategory = NormalizeCategory(row.category).toLowerCase();
        const byCreator = SafeText(row.creator).toLowerCase();

        if (searchBy === "All" && !byAll.includes(normalizedSearch)) {
          return false;
        }

        if (
          searchBy === "Patron Name" &&
          !byPatronName.includes(normalizedSearch)
        ) {
          return false;
        }

        if (searchBy === "Patron ID" && byPatronId !== normalizedSearch) {
          return false;
        }

        if (
          searchBy === "Item Title" &&
          !byItemTitle.includes(normalizedSearch)
        ) {
          return false;
        }

        if (searchBy === "Item ID" && byItemId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "Category" && !byCategory.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Creator" && !byCreator.includes(normalizedSearch)) {
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
    reportRows,
    categoryFilter,
    minDaysOverdue,
    searchBy,
    searchText,
    sortBy,
    sortDirection,
  ]);

  const summary = useMemo(() => {
    const totalOverdueLoans = filteredRows.length;

    const uniquePatrons = new Set(
      filteredRows.map((row) => SafeText(row.patronId))
    ).size;

    const estimatedOutstandingFine = filteredRows.reduce(
      (sum, row) => sum + SafeNumber(row.currentFine),
      0
    );

    return {
      totalOverdueLoans,
      uniquePatrons,
      estimatedOutstandingFine,
    };
  }, [filteredRows]);

  const dateRangeLabel = useMemo(() => {
    if (startDate && endDate) {
      return `Showing this operational view for overdue items with due dates from ${FormatDateLabel(
        startDate
      )} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing overdue items with due dates from ${FormatDateLabel(
        startDate
      )} onward.`;
    }

    if (endDate) {
      return `Showing overdue items with due dates up to ${FormatDateLabel(
        endDate
      )}.`;
    }

    return "Showing current operational overdue items for all available due dates.";
  }, [startDate, endDate]);

  function ResetFilters() {
    const currentMonth = GetCurrentMonthDateRange();

    setStartDate(currentMonth.start);
    setEndDate(currentMonth.end);
    setCategoryFilter("All");
    setMinDaysOverdue("");
    setSearchBy("All");
    setSearchText("");
    setSortBy("daysOverdue");
    setSortDirection("desc");
    showInfo("Operations report filters reset to this month.");
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin Report
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Operations Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-300">
        Note: This report defaults to the current month and highlights operational
        records that may require staff attention.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Review this month’s library operations, including overdue loans and
        related circulation issues. Use filters to view other date ranges when needed.
      </p>

      {isLoading ? (
        <div className="mt-8 text-slate-300">Loading operations report...</div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-300">
              {dateRangeLabel}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Current Overdue Loans"
              value={summary.totalOverdueLoans}
            />
            <SummaryCard
              title="Overdue Patrons"
              value={summary.uniquePatrons}
            />
            <SummaryCard
              title="Estimated Outstanding Fine"
              value={FormatMoney(summary.estimatedOutstandingFine)}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-xl font-semibold text-white">
              Search / Filter / Sort
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Due Date Start
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
                  Due Date End
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
                  Filter By Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option>All</option>
                  <option>Book</option>
                  <option>Periodical</option>
                  <option>Audiovisual Media</option>
                  <option>Equipment</option>
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
                  <option>All</option>
                  <option>Patron Name</option>
                  <option>Patron ID</option>
                  <option>Item Title</option>
                  <option>Item ID</option>
                  <option>Category</option>
                  <option>Creator</option>
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
                  <option value="daysOverdue">Days Overdue</option>
                  <option value="loanDueDate">Due Date</option>
                  <option value="loanStartDate">Borrow Date</option>
                  <option value="currentFine">Estimated Fine</option>
                  <option value="dailyFine">Daily Fine</option>
                  <option value="patronName">Patron Name</option>
                  <option value="patronId">Patron ID</option>
                  <option value="title">Item Title</option>
                  <option value="itemId">Item ID</option>
                  <option value="category">Category</option>
                  <option value="loanId">Loan ID</option>
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

            <div className="mt-5">
              <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-xl font-semibold text-white">
              Current Overdue Loans
            </h2>

            <div className="mt-4 overflow-x-auto">
              {filteredRows.length === 0 ? (
                <div className="text-slate-300">No overdue operational records found for the selected filters.</div>
              ) : (
                <table className="min-w-full border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-2 py-3">Loan ID</th>
                      <th className="px-2 py-3">Item ID</th>
                      <th className="px-2 py-3">Item Name</th>
                      <th className="px-2 py-3">Category</th>
                      <th className="px-2 py-3">Patron</th>
                      <th className="px-2 py-3">Borrow Date</th>
                      <th className="px-2 py-3">Due Date</th>
                      <th className="px-2 py-3">Days Overdue</th>
                      <th className="px-2 py-3">Daily Fine</th>
                      <th className="px-2 py-3">Estimated Fine</th>
                      <th className="px-2 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((row) => {
                      const isReturnPending = returnPendingLoanId === row.loanId;
                      const isLostPending = lostPendingLoanId === row.loanId;
                      const canMarkLost = SafeNumber(row.daysOverdue) >= 60;

                      return (
                        <tr
                          key={row.loanId}
                          className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                        >
                          <td className="px-4 py-3">
                            {row.loanId}
                          </td>
                          <td className="px-4 py-3">
                            {row.itemId}
                          </td>
                          <td className="px-4 py-3 text-white">
                            {row.title}
                          </td>
                          <td className="px-4 py-3">
                            {NormalizeCategory(row.category)}
                          </td>
                          <td className="px-4 py-3">
                            {row.patronName} ({row.patronId})
                          </td>
                          <td className="px-4 py-3">
                            {row.loanStartDate
                              ? FormatDate(new Date(row.loanStartDate), true)
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {row.loanDueDate
                              ? FormatDate(new Date(row.loanDueDate), true)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-300">
                            {row.daysOverdue}
                          </td>
                          <td className="px-4 py-3">
                            {FormatMoney(row.dailyFine)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-300">
                            {FormatMoney(row.currentFine)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <PrimaryButton
                                title={isReturnPending ? "Returning..." : "Return"}
                                disabledValue={isReturnPending || isLostPending}
                                onClick={() => HandleReturn(row.loanId)}
                              />
                              <SecondaryButton
                                title={isLostPending ? "Marking..." : "Mark as Lost"}
                                disabled={
                                  isReturnPending ||
                                  isLostPending ||
                                  !canMarkLost
                                }
                                onClick={() => HandleMarkAsLost(row.loanId)}
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
          </div>
        </>
      )}
    </section>
  );
}