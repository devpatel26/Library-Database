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

function FormatDateLabel(value) {
  if (!value) {
    return "Any time";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function SummaryCard({ title, value, subtitle = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      {subtitle ? (
        <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
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

function NormalizeDobForSearch(value) {
  if (!value) {
    return { full: "", monthDay: "" };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { full: "", monthDay: "" };
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    full: `${year}-${month}-${day}`,
    monthDay: `${month}/${day}`,
  };
}

function NormalizeRole(role) {
  const text = SafeText(role).trim().toLowerCase();

  if (text === "staff") {
    return "Staff";
  }

  if (text === "patron") {
    return "Patron";
  }

  return SafeText(role) || "Unknown";
}

function NormalizeAccountStatus(status) {
  const text = SafeText(status).trim().toLowerCase();

  if (
    text === "inactive" ||
    text === "disabled" ||
    text === "suspended" ||
    text === "deleted"
  ) {
    return "Inactive";
  }

  return "Active";
}

function BuildSortValue(user, sortBy) {
  switch (sortBy) {
    case "userId":
      return SafeNumber(user.userId);
    case "name":
      return SafeText(user.name).toLowerCase();
    case "role":
      return NormalizeRole(user.role).toLowerCase();
    case "accountStatus":
      return NormalizeAccountStatus(user.accountStatus).toLowerCase();
    case "email":
      return SafeText(user.email).toLowerCase();
    case "dob":
      return ParseDateValue(user.dob)?.getTime() ?? 0;
    default:
      return SafeNumber(user.userId);
  }
}

export default function AllUsersReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [userFilter, setUserFilter] = useState("All");
  const [searchBy, setSearchBy] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [sortBy, setSortBy] = useState("userId");
  const [sortDirection, setSortDirection] = useState("asc");

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
      showError("Only admin can access the all users report.");

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
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load all users report.");
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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = users.filter((user) => {
      const lastActivityDate = ParseDateValue(user.lastActivityDate);
      const role = NormalizeRole(user.role);
      const accountStatus = NormalizeAccountStatus(user.accountStatus);

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

      if (userFilter === "Patrons Only" && role !== "Patron") {
        return false;
      }

      if (userFilter === "Staff Only" && role !== "Staff") {
        return false;
      }

      if (userFilter === "Active Only" && accountStatus !== "Active") {
        return false;
      }

      if (userFilter === "Inactive Only" && accountStatus !== "Inactive") {
        return false;
      }

      if (
        userFilter === "Active Patrons" &&
        !(role === "Patron" && accountStatus === "Active")
      ) {
        return false;
      }

      if (
        userFilter === "Inactive Patrons" &&
        !(role === "Patron" && accountStatus === "Inactive")
      ) {
        return false;
      }

      if (
        userFilter === "Active Staff" &&
        !(role === "Staff" && accountStatus === "Active")
      ) {
        return false;
      }

      if (
        userFilter === "Inactive Staff" &&
        !(role === "Staff" && accountStatus === "Inactive")
      ) {
        return false;
      }

      if (normalizedSearch) {
        const byAll = [
          user.userId,
          user.name,
          role,
          accountStatus,
          user.email,
          user.dob,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byId = SafeText(user.userId).toLowerCase();
        const byName = SafeText(user.name).toLowerCase();
        const byRole = role.toLowerCase();
        const byStatus = accountStatus.toLowerCase();
        const byEmail = SafeText(user.email).toLowerCase();

        if (searchBy === "DOB") {
          const dobSearch = normalizedSearch.replace(/\s+/g, "");
          const dobValue = NormalizeDobForSearch(user.dob);

          const isFullDateMatch = dobSearch === dobValue.full;
          const isMonthDayMatch = dobSearch === dobValue.monthDay;

          if (!isFullDateMatch && !isMonthDayMatch) {
            return false;
          }
        }
        
        if (searchBy === "User ID" && byId !== normalizedSearch) {
          return false;
        }

        if (searchBy === "Name" && !byName.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Role" && !byRole.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Account Status" && !byStatus.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Email" && !byEmail.includes(normalizedSearch)) {
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
    users,
    startDate,
    endDate,
    userFilter,
    searchBy,
    searchText,
    sortBy,
    sortDirection,
  ]);

  const summary = useMemo(() => {
    const allUsers = filteredUsers.length;

    const patronUsers = filteredUsers.filter(
      (user) => NormalizeRole(user.role) === "Patron"
    );
    const staffUsers = filteredUsers.filter(
      (user) => NormalizeRole(user.role) === "Staff"
    );

    const activePatrons = patronUsers.filter(
      (user) => NormalizeAccountStatus(user.accountStatus) === "Active"
    ).length;

    const inactivePatrons = patronUsers.filter(
      (user) => NormalizeAccountStatus(user.accountStatus) === "Inactive"
    ).length;

    const activeStaff = staffUsers.filter(
      (user) => NormalizeAccountStatus(user.accountStatus) === "Active"
    ).length;

    const inactiveStaff = staffUsers.filter(
      (user) => NormalizeAccountStatus(user.accountStatus) === "Inactive"
    ).length;

    return {
      allUsers,
      totalPatrons: patronUsers.length,
      activePatrons,
      inactivePatrons,
      totalStaff: staffUsers.length,
      activeStaff,
      inactiveStaff,
    };
  }, [filteredUsers]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) {
      return "Showing all users regardless of last activity date.";
    }

    if (startDate && endDate) {
      return `Showing users with last activity from ${FormatDateLabel(
        startDate
      )} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing users with last activity from ${FormatDateLabel(startDate)} onward.`;
    }

    return `Showing users with last activity up to ${FormatDateLabel(endDate)}.`;
  }, [startDate, endDate]);

  function ResetFilters() {
    setStartDate("");
    setEndDate("");
    setUserFilter("All");
    setSearchBy("All");
    setSearchText("");
    setSortBy("userId");
    setSortDirection("asc");
    showInfo("All users report filters reset.");
  }

  return (
    <section className="flex w-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        All Users Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-700">
        Note: Date filters in this report use each user’s most recent activity date.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        Review all patron and staff accounts with flexible search, filter, and sorting tools.
      </p>

      {isLoading ? (
        <div className="mt-8 font-medium text-slate-600">Loading all users report...</div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-700">{dateRangeLabel}</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <SummaryCard title="All Users" value={summary.allUsers} />
            <SummaryCard title="Total Patrons" value={summary.totalPatrons} />
            <SummaryCard title="Active Patrons" value={summary.activePatrons} />
            <SummaryCard title="Inactive Patrons" value={summary.inactivePatrons} />
            <SummaryCard title="Total Staff" value={summary.totalStaff} />
            <SummaryCard title="Active Staff" value={summary.activeStaff} />
            <SummaryCard title="Inactive Staff" value={summary.inactiveStaff} />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Search / Filter / Sort
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Start Date
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
                  End Date
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
                  Filter By User Type
                </label>
                <select
                  value={userFilter}
                  onChange={(event) => setUserFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option>All</option>
                  <option>Patrons Only</option>
                  <option>Staff Only</option>
                  <option>Active Only</option>
                  <option>Inactive Only</option>
                  <option>Active Patrons</option>
                  <option>Inactive Patrons</option>
                  <option>Active Staff</option>
                  <option>Inactive Staff</option>
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
                  <option>User ID</option>
                  <option>Name</option>
                  <option>Role</option>
                  <option>Account Status</option>
                  <option>Email</option>
                  <option>DOB</option>
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
                  placeholder="Enter search value...(enter DOB as YYYY-MM-DD or MM/DD)"
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
                  <option value="userId">User ID</option>
                  <option value="name">Name</option>
                  <option value="role">Role</option>
                  <option value="accountStatus">Account Status</option>
                  <option value="email">Email</option>
                  <option value="dob">DOB</option>
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
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              User Detail Table
            </h2>

            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-sm text-slate-700 border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold">User ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Account Status</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">DOB</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center font-medium text-slate-500">
                        No user records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={`${user.role}-${user.userId}`}
                        className="border-b border-slate-100 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{user.userId}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {user.name || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {NormalizeRole(user.role)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${NormalizeAccountStatus(user.accountStatus) === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'}`}>
                            {NormalizeAccountStatus(user.accountStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.email || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {user.dob
                            ? FormatDate(new Date(user.dob), true)
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