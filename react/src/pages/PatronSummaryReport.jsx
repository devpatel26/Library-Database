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

function FormatMoney(value) {
  return `$${SafeNumber(value).toFixed(2)}`;
}

function FormatDateLabel(value) {
  if (!value) {
    return "Any time";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
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

function ParseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function BuildSortValue(patron, sortBy) {
  switch (sortBy) {
    case "patronId":
      return SafeNumber(patron.patronId);
    case "patronName":
      return SafeText(patron.patronName).toLowerCase();
    case "totalLoansHistory":
      return SafeNumber(patron.totalLoansHistory);
    case "currentLoans":
      return SafeNumber(patron.currentLoans);
    case "returnedLoans":
      return SafeNumber(patron.returnedLoans);
    case "totalHoldsHistory":
      return SafeNumber(patron.totalHoldsHistory);
    case "activeHolds":
      return SafeNumber(patron.activeHolds);
    case "totalFineRecords":
      return SafeNumber(patron.totalFineRecords);
    case "outstandingBalance":
      return SafeNumber(patron.outstandingBalance);
    case "totalPaidAmount":
      return SafeNumber(patron.totalPaidAmount);
    case "lastActivityDate":
      return ParseDateValue(patron.lastActivityDate)?.getTime() ?? 0;
    default:
      return SafeNumber(patron.totalLoansHistory);
  }
}

export default function PatronSummaryReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const [patrons, setPatrons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activityFilter, setActivityFilter] = useState("All");
  const [searchBy, setSearchBy] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [sortBy, setSortBy] = useState("totalLoansHistory");
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
      showError("Only admin can access the patron summary report.");

      const timeoutId = setTimeout(() => {
        window.location.href = "/report";
      }, 1200);

      return () => clearTimeout(timeoutId);
    }

    let isMounted = true;

    async function LoadReport() {
      try {
        setIsLoading(true);
        const data = await FetchJson("/api/reports/patron-summary");

        if (isMounted) {
          setPatrons(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load patron summary report.");
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

  const filteredPatrons = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = patrons.filter((patron) => {
      const lastActivityDate = ParseDateValue(patron.lastActivityDate);

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (!lastActivityDate || lastActivityDate < start) {
          return false;
        }
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (!lastActivityDate || lastActivityDate > end) {
          return false;
        }
      }

      if (activityFilter === "Has Current Loans" && SafeNumber(patron.currentLoans) <= 0) {
        return false;
      }

      if (activityFilter === "Has Holds" && SafeNumber(patron.activeHolds) <= 0) {
        return false;
      }

      if (activityFilter === "Has Loan History" &&
        SafeNumber(patron.totalLoansHistory) <= 0
      ) {
        return false;
      }

      if (
        activityFilter === "Has Fine History" &&
        SafeNumber(patron.totalFineRecords) <= 0
      ) {
        return false;
      }

      if (
        activityFilter === "Has Outstanding Fines" &&
        SafeNumber(patron.outstandingBalance) <= 0
      ) {
        return false;
      }

      if (
        activityFilter === "No Activity" &&
        (
          SafeNumber(patron.totalLoansHistory) > 0 ||
          SafeNumber(patron.totalHoldsHistory) > 0 ||
          SafeNumber(patron.totalFineRecords) > 0
        )
      ) {
        return false;
      }

      if (
        activityFilter === "Has Any Activity" &&
        SafeNumber(patron.totalLoansHistory) === 0 &&
        SafeNumber(patron.totalHoldsHistory) === 0 &&
        SafeNumber(patron.totalFineRecords) === 0
      ) {
        return false;
      }

      if (normalizedSearch) {
        const byAll = [
          patron.patronId,
          patron.patronName,
          patron.totalLoansHistory,
          patron.currentLoans,
          patron.activeHolds,
          patron.outstandingBalance,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byName = SafeText(patron.patronName).toLowerCase();
        const byId = SafeText(patron.patronId).toLowerCase();

        if (searchBy === "Patron ID" && byId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "Patron Name" && !byName.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Patron ID" && byId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "All" && !byAll.includes(normalizedSearch)) {
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
    patrons,
    startDate,
    endDate,
    activityFilter,
    searchBy,
    searchText,
    sortBy,
    sortDirection,
  ]);

  const summary = useMemo(() => {
    const totalPatrons = filteredPatrons.length;

    const totalLoansHistory = filteredPatrons.reduce(
      (sum, patron) => sum + SafeNumber(patron.totalLoansHistory),
      0
    );

    const currentLoans = filteredPatrons.reduce(
      (sum, patron) => sum + SafeNumber(patron.currentLoans),
      0
    );

    const activeHolds = filteredPatrons.reduce(
      (sum, patron) => sum + SafeNumber(patron.activeHolds),
      0
    );

    const outstandingBalance = filteredPatrons.reduce(
      (sum, patron) => sum + SafeNumber(patron.outstandingBalance),
      0
    );

    const patronsWithBalance = filteredPatrons.filter(
      (patron) => SafeNumber(patron.outstandingBalance) > 0
    ).length;

    const patronsWithAnyActivity = filteredPatrons.filter(
      (patron) =>
        SafeNumber(patron.totalLoansHistory) > 0 ||
        SafeNumber(patron.totalHoldsHistory) > 0 ||
        SafeNumber(patron.totalFineRecords) > 0
    ).length;



    const mostActivePatron = [...filteredPatrons].sort(
      (a, b) => SafeNumber(b.totalLoansHistory) - SafeNumber(a.totalLoansHistory)
    )[0];

    return {
      totalPatrons,
      totalLoansHistory,
      currentLoans,
      activeHolds,
      outstandingBalance,
      patronsWithBalance,
      patronsWithAnyActivity,
      mostActivePatronName: mostActivePatron?.patronName ?? "-",
      mostActivePatronLoans: mostActivePatron?.totalLoansHistory ?? 0,
    };
  }, [filteredPatrons]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) {
      return "Showing all patrons regardless of last activity date.";
    }

    if (startDate && endDate) {
      return `Showing patrons with last activity from ${FormatDateLabel(
        startDate
      )} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing patrons with last activity from ${FormatDateLabel(startDate)} onward.`;
    }

    return `Showing patrons with last activity up to ${FormatDateLabel(endDate)}.`;
  }, [startDate, endDate]);

  function ResetFilters() {
    setStartDate("");
    setEndDate("");
    setActivityFilter("All");
    setSearchBy("All");
    setSearchText("");
    setSortBy("totalLoansHistory");
    setSortDirection("desc");
    showInfo("Patron summary filters reset.");
  }

  return (
    <section className="flex w-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin Report
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Patron Summary Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-300">
        Note: Date filters in this report use each patron’s most recent activity date
        across loans, holds, and fines.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Review patron borrowing activity, holds, fines, and balances with flexible
        search, filter, and sorting tools.
      </p>

      {isLoading ? (
        <div className="mt-8 text-slate-300">Loading patron summary report...</div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-300">{dateRangeLabel}</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard title="Total Patrons" value={summary.totalPatrons} />
            <SummaryCard title="Total Loans History" value={summary.totalLoansHistory} />
            <SummaryCard title="Current Loans" value={summary.currentLoans} />
            <SummaryCard title="Active Holds" value={summary.activeHolds} />
            <SummaryCard
              title="Outstanding Balance"
              value={FormatMoney(summary.outstandingBalance)}
            />
            <SummaryCard
              title="Patrons With Balance"
              value={summary.patronsWithBalance}
            />
            <SummaryCard
              title="Patrons With Activity"
              value={summary.patronsWithAnyActivity}
            />
            <SummaryCard
              title="Most Active Patron"
              value={summary.mostActivePatronName}
              subtitle={`${summary.mostActivePatronLoans} total loans`}
            />
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
                  Filter By Activity
                </label>
                <select
                  value={activityFilter}
                  onChange={(event) => setActivityFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Has Current Loans
                  </option>
                  <option>
                    Has Holds
                  </option>
                  <option>
                    Has Outstanding Fines
                  </option>
                  <option>
                    Has Loan History
                  </option>
                  <option>
                    Has Fine History
                  </option>
                  <option>
                    Has Any Activity
                  </option>
                  <option>
                    No Activity
                  </option>
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
                  <option>
                    All
                  </option>
                  <option>
                    Patron Name
                  </option>
                  <option>
                    Patron ID
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
                  <option value="totalLoansHistory">
                    Total Loans History
                  </option>
                  <option value="currentLoans">
                    Current Loans
                  </option>
                  <option value="returnedLoans">
                    Returned Loans
                  </option>
                  <option value="totalHoldsHistory">
                    Total Holds History
                  </option>
                  <option value="activeHolds">
                    Active Holds
                  </option>
                  <option value="totalFineRecords">
                    Fine Records
                  </option>
                  <option value="outstandingBalance">
                    Outstanding Balance
                  </option>
                  <option value="totalPaidAmount">
                    Total Paid Amount
                  </option>
                  <option value="lastActivityDate">
                    Last Activity Date
                  </option>
                  <option value="patronName">
                    Patron Name
                  </option>
                  <option value="patronId">
                    Patron ID
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
              Patron Detail Table
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-300">
                    <th className="px-3 py-2">
                      Patron ID
                    </th>
                    <th className="px-3 py-2">
                      Patron Name
                    </th>
                    <th className="px-3 py-2">
                      Total Loans
                    </th>
                    <th className="px-3 py-2">
                      Current Loans
                    </th>
                    <th className="px-3 py-2">
                      Returned Loans
                    </th>
                    <th className="px-3 py-2">
                      Total Holds
                    </th>
                    <th className="px-3 py-2">
                      Active Holds
                    </th>
                    <th className="px-3 py-2">
                      Fine Records
                    </th>
                    <th className="px-3 py-2">
                      Outstanding Balance
                    </th>
                    <th className="px-3 py-2">
                      Paid Amount
                    </th>
                    <th className="px-3 py-2">
                      Last Loan Date
                    </th>
                    <th className="px-3 py-2">
                      Last Hold Date
                    </th>
                    <th className="px-3 py-2">
                      Last Fine Date
                    </th>
                    <th className="px-3 py-2">
                      Last Activity Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatrons.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-5 text-slate-400">
                        No patron records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPatrons.map((patron) => (
                      <tr
                        key={patron.patronId}
                        className="border-b border-white/5 text-slate-200"
                      >
                        <td className="px-3 py-3">{patron.patronId}</td>
                        <td className="px-3 py-3 font-semibold text-white">
                          {patron.patronName}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.totalLoansHistory)}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.currentLoans)}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.returnedLoans)}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.totalHoldsHistory)}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.activeHolds)}
                        </td>
                        <td className="px-3 py-3">
                          {SafeNumber(patron.totalFineRecords)}
                        </td>
                        <td className="px-3 py-3 font-semibold text-red-300">
                          {FormatMoney(patron.outstandingBalance)}
                        </td>
                        <td className="px-3 py-3">
                          {FormatMoney(patron.totalPaidAmount)}
                        </td>
                        <td className="px-3 py-3">
                          {patron.lastLoanDate
                            ? FormatDate(new Date(patron.lastLoanDate), true)
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {patron.lastHoldDate
                            ? FormatDate(new Date(patron.lastHoldDate), true)
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {patron.lastFineDate
                            ? FormatDate(new Date(patron.lastFineDate), true)
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          {patron.lastActivityDate
                            ? FormatDate(new Date(patron.lastActivityDate), true)
                            : "-"}
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