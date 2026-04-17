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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm font-medium text-slate-600">
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
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        Operations Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-700">
        Note: This report defaults to the current month and highlights operational
        activity in the library.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        Review monthly library operations including circulation activity,
        collection growth, and patron registration. Use filters to view
        a different date range when needed.
      </p>

      {isLoading ? (
        <div className="mt-8 font-medium text-slate-600">Loading operations report...</div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-700">
              {dateRangeLabel}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <SummaryCard title="Loans" value={filteredSummary.loans} />
            <SummaryCard title="Returns" value={filteredSummary.returns} />
            <SummaryCard title="Lost Items" value={filteredSummary.lost} />
            <SummaryCard title="New Items" value={filteredSummary.newItems} />
            <SummaryCard title="New Patrons" value={filteredSummary.newPatrons} />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Search / Filter / Sort
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Date Start
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Date End
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Filter By Activity
                </label>
                <select
                  value={activityFilter}
                  onChange={(event) => setActivityFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
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
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Search By
                </label>
                <select
                  value={searchBy}
                  onChange={(event) => setSearchBy(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
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
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Search Text
                </label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Enter search value..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
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
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Sort Direction
                </label>
                <select
                  value={sortDirection}
                  onChange={(event) => setSortDirection(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Monthly Operational Activity
            </h2>

            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              {filteredActivities.length === 0 ? (
                <div className="p-5 text-center font-medium text-slate-500 bg-white">
                  No operational records found for the selected filters.
                </div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-sm text-slate-700 border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold">Activity Type</th>
                      <th className="px-4 py-3 font-semibold">Record ID</th>
                      <th className="px-4 py-3 font-semibold">Item ID</th>
                      <th className="px-4 py-3 font-semibold">Item Title</th>
                      <th className="px-4 py-3 font-semibold">Patron</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredActivities.map((row, index) => (
                      <tr
                        key={`${row.activityType}-${row.recordId}-${index}`}
                        className="border-b border-slate-100 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-sky-700">
                          {row.activityType || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {row.recordId ?? "-"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.itemId ?? "-"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {row.title || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {row.patronName
                            ? <>{row.patronName} <span className="text-slate-400">{row.patronId ? `(${row.patronId})` : ""}</span></>
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {row.activityDate
                            ? FormatDate(new Date(row.activityDate), true)
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {row.status || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
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