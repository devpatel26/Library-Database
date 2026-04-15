import React, { useEffect, useMemo, useState } from "react";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import PrimaryButton from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";

function SafeText(value) {
  return value == null ? "" : String(value);
}

function SafeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
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
    case "activityType":
      return SafeText(row.activityType).toLowerCase();
    case "recordId":
      return SafeNumber(row.recordId);
    case "itemId":
      return SafeNumber(row.itemId);
    case "title":
      return SafeText(row.title).toLowerCase();
    case "patronName":
      return SafeText(row.patronName).toLowerCase();
    case "patronId":
      return SafeNumber(row.patronId);
    case "activityDate":
      return ParseDateValue(row.activityDate)?.getTime() ?? 0;
    case "status":
      return SafeText(row.status).toLowerCase();
    default:
      return ParseDateValue(row.activityDate)?.getTime() ?? 0;
  }
}

export default function OverdueReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const defaultDateRange = GetCurrentMonthDateRange();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState(defaultDateRange.start);
  const [endDate, setEndDate] = useState(defaultDateRange.end);

  const [activityFilter, setActivityFilter] = useState("All");
  const [searchBy, setSearchBy] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [sortBy, setSortBy] = useState("activityDate");
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
          ? `/api/reports/operations?${queryString}`
          : "/api/reports/operations";

        const data = await FetchJson(url);

        if (isMounted) {
          setActivities(Array.isArray(data.activities) ? data.activities : []);
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

  const filteredActivities = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = activities.filter((row) => {
      if (
        activityFilter !== "All" &&
        SafeText(row.activityType) !== activityFilter
      ) {
        return false;
      }

      if (normalizedSearch) {
        const byAll = [
          row.activityType,
          row.recordId,
          row.itemId,
          row.title,
          row.patronName,
          row.patronId,
          row.status,
          row.details,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byActivityType = SafeText(row.activityType).toLowerCase();
        const byRecordId = SafeText(row.recordId).toLowerCase();
        const byItemTitle = SafeText(row.title).toLowerCase();
        const byPatronName = SafeText(row.patronName).toLowerCase();
        const byPatronId = SafeText(row.patronId).toLowerCase();
        const byStatus = SafeText(row.status).toLowerCase();

        if (searchBy === "All" && !byAll.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Activity Type" && !byActivityType.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Record ID" && byRecordId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "Item Title" && !byItemTitle.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Patron Name" && !byPatronName.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Patron ID" && byPatronId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "Status" && !byStatus.includes(normalizedSearch)) {
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
    activities,
    activityFilter,
    searchBy,
    searchText,
    sortBy,
    sortDirection,
  ]);

  const filteredSummary = useMemo(() => {
  return {
    loans: filteredActivities.filter(
      (row) => SafeText(row.activityType) === "Loan"
    ).length,

    returns: filteredActivities.filter(
      (row) => SafeText(row.activityType) === "Return"
    ).length,

    lost: filteredActivities.filter(
      (row) => SafeText(row.activityType) === "Lost Item"
    ).length,

    newItems: filteredActivities.filter(
      (row) => SafeText(row.activityType) === "New Item"
    ).length,

    newPatrons: filteredActivities.filter(
      (row) => SafeText(row.activityType) === "New Patron"
    ).length,
  };
}, [filteredActivities]);

  const dateRangeLabel = useMemo(() => {
    if (startDate && endDate) {
      return `Showing operational activity from ${FormatDateLabel(
        startDate
      )} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing operational activity from ${FormatDateLabel(startDate)} onward.`;
    }

    if (endDate) {
      return `Showing operational activity up to ${FormatDateLabel(endDate)}.`;
    }

    return "Showing operational activity for all available dates.";
  }, [startDate, endDate]);

  function ResetFilters() {
    const currentMonth = GetCurrentMonthDateRange();

    setStartDate(currentMonth.start);
    setEndDate(currentMonth.end);
    setActivityFilter("All");
    setSearchBy("All");
    setSearchText("");
    setSortBy("activityDate");
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
        activity in the library.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Review monthly library operations including circulation activity,
        collection growth, and patron registration. Use filters to view
        a different date range when needed.
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard title="Loans" value={filteredSummary.loans} />
            <SummaryCard title="Returns" value={filteredSummary.returns} />
            <SummaryCard title="Lost Items" value={filteredSummary.lost} />
            <SummaryCard title="New Items" value={filteredSummary.newItems} />
            <SummaryCard title="New Patrons" value={filteredSummary.newPatrons} />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-xl font-semibold text-white">
              Search / Filter / Sort
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Date Start
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
                  Date End
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
                  Filter By Activity
                </label>
                <select
                  value={activityFilter}
                  onChange={(event) => setActivityFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option>All</option>
                  <option>Loan</option>
                  <option>Return</option>
                  <option>Lost Item</option>
                  <option>New Item</option>
                  <option>New Patron</option>
                </select>
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
                  <option>Activity Type</option>
                  <option>Record ID</option>
                  <option>Item Title</option>
                  <option>Patron Name</option>
                  <option>Patron ID</option>
                  <option>Status</option>
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
                  <option value="activityDate">Activity Date</option>
                  <option value="activityType">Activity Type</option>
                  <option value="recordId">Record ID</option>
                  <option value="itemId">Item ID</option>
                  <option value="title">Item Title</option>
                  <option value="patronName">Patron Name</option>
                  <option value="patronId">Patron ID</option>
                  <option value="status">Status</option>
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
              Monthly Operational Activity
            </h2>

            <div className="mt-4 overflow-x-auto">
              {filteredActivities.length === 0 ? (
                <div className="text-slate-300">
                  No operational records found for the selected filters.
                </div>
              ) : (
                <table className="min-w-full border-collapse overflow-hidden rounded-xl">
                  <thead>
                    <tr className="bg-slate-800 text-left text-sm text-slate-200">
                      <th className="px-3 py-3">Activity Type</th>
                      <th className="px-3 py-3">Record ID</th>
                      <th className="px-3 py-3">Item ID</th>
                      <th className="px-3 py-3">Item Title</th>
                      <th className="px-3 py-3">Patron</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredActivities.map((row, index) => (
                      <tr
                        key={`${row.activityType}-${row.recordId}-${index}`}
                        className="border-t border-white/10 bg-slate-950/30 text-slate-300"
                      >
                        <td className="px-3 py-3 font-semibold text-sky-300">
                          {row.activityType || "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.recordId ?? "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.itemId ?? "-"}
                        </td>
                        <td className="px-3 py-3 text-white">
                          {row.title || "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.patronName
                            ? `${row.patronName}${row.patronId ? ` (${row.patronId})` : ""}`
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.activityDate
                            ? FormatDate(new Date(row.activityDate), true)
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.status || "-"}
                        </td>
                        <td className="px-3 py-3">
                          {row.details || "-"}
                        </td>
                      </tr>
                    ))}
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