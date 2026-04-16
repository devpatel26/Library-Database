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

function BuildSortValue(item, sortBy) {
  switch (sortBy) {
    case "itemId":
      return SafeNumber(item.itemId);
    case "title":
      return SafeText(item.title).toLowerCase();
    case "creator":
      return SafeText(item.creator).toLowerCase();
    case "category":
      return NormalizeCategory(item.category).toLowerCase();
    case "genre":
      return SafeText(item.genre).toLowerCase();
    case "publisher":
      return SafeText(item.publisher).toLowerCase();
    case "publicationDate":
      return item.publicationDate
        ? new Date(item.publicationDate).getTime()
        : 0;
    case "loanCount":
      return SafeNumber(item.loanCount);
    default:
      return SafeNumber(item.loanCount);
  }
}

export default function PopularityReport() {
  const { showError, showWarning, showInfo } = useMessage();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All Genres");

  const [searchBy, setSearchBy] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [sortBy, setSortBy] = useState("loanCount");
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
      showError("Only admin can access the popularity report.");

      const timeoutId = setTimeout(() => {
        window.location.href = "/report";
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
          ? `/api/reports/popularity?${queryString}`
          : "/api/reports/popularity";

        const data = await FetchJson(url);

        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load popularity report.");
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

  const availableGenres = useMemo(() => {
    const uniqueGenres = new Set();

    items.forEach((item) => {
      const genre = SafeText(item.genre).trim();
      if (genre) {
        uniqueGenres.add(genre);
      }
    });

    return [
      "All Genres",
      ...Array.from(uniqueGenres).sort((a, b) => a.localeCompare(b)),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = items.filter((item) => {
      const normalizedCategory = NormalizeCategory(item.category);
      const normalizedGenre = SafeText(item.genre).trim();

      if (categoryFilter !== "All" && normalizedCategory !== categoryFilter) {
        return false;
      }

      if (genreFilter !== "All Genres" && normalizedGenre !== genreFilter) {
        return false;
      }

      if (normalizedSearch) {
        const byAll = [
          item.itemId,
          item.title,
          item.creator,
          item.category,
          item.genre,
          item.publisher,
        ]
          .map(SafeText)
          .join(" ")
          .toLowerCase();

        const byTitle = SafeText(item.title).toLowerCase();
        const byCreator = SafeText(item.creator).toLowerCase();
        const byItemId = SafeText(item.itemId).toLowerCase();
        const byCategory = NormalizeCategory(item.category).toLowerCase();
        const byGenre = SafeText(item.genre).toLowerCase();
        const byPublisher = SafeText(item.publisher).toLowerCase();

        if (searchBy === "All" && !byAll.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Title" && !byTitle.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Creator" && !byCreator.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Item ID" && !byItemId.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Category" && !byCategory.includes(normalizedSearch)) {
          return false;
        }

        if (searchBy === "Genre" && !byGenre.includes(normalizedSearch)) {
          return false;
        }

        if (
          searchBy === "Publisher" &&
          !byPublisher.includes(normalizedSearch)
        ) {
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
    items,
    categoryFilter,
    genreFilter,
    searchBy,
    searchText,
    sortBy,
    sortDirection,
  ]);

  const summary = useMemo(() => {
    const totalLoans = filteredItems.reduce(
      (sum, item) => sum + SafeNumber(item.loanCount),
      0
    );

    const uniqueItems = filteredItems.length;

    const categoryTotals = {};
    const genreTotals = {};

    filteredItems.forEach((item) => {
      const category = NormalizeCategory(item.category);
      const genre = SafeText(item.genre).trim() || "Unspecified";
      const loanCount = SafeNumber(item.loanCount);

      categoryTotals[category] = (categoryTotals[category] ?? 0) + loanCount;
      genreTotals[genre] = (genreTotals[genre] ?? 0) + loanCount;
    });

    const topCategory =
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    const topGenre =
      Object.entries(genreTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    const topItem = [...filteredItems].sort(
      (a, b) => SafeNumber(b.loanCount) - SafeNumber(a.loanCount)
    )[0];

    return {
      totalLoans,
      uniqueItems,
      topCategory,
      topGenre,
      topItemTitle: topItem?.title ?? "-",
      topItemLoanCount: topItem?.loanCount ?? 0,
    };
  }, [filteredItems]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) {
      return "Showing popularity data for all available loan dates.";
    }

    if (startDate && endDate) {
      return `Showing popularity data from ${FormatDateLabel(
        startDate
      )} to ${FormatDateLabel(endDate)}.`;
    }

    if (startDate) {
      return `Showing popularity data from ${FormatDateLabel(startDate)} onward.`;
    }

    return `Showing popularity data up to ${FormatDateLabel(endDate)}.`;
  }, [startDate, endDate]);

  function ResetFilters() {
    setStartDate("");
    setEndDate("");
    setCategoryFilter("All");
    setGenreFilter("All Genres");
    setSearchBy("All");
    setSearchText("");
    setSortBy("loanCount");
    setSortDirection("desc");
    showInfo("Popularity report filters reset.");
  }

  return (
    <section className="flex w-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-700">
        Admin Report
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        Popularity Report
      </h1>

      <p className="mt-3 text-sm font-medium text-sky-700">
        Note: Dates in this report refer to item loan dates used to measure
        popularity.
      </p>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        Review the most borrowed items across categories, filter by genre and
        format, and analyze popularity with flexible search and sorting tools.
      </p>

      {isLoading ? (
        <div className="mt-8 font-medium text-slate-600">
          Loading popularity report...
        </div>
      ) : (
        <>
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-700">
              {dateRangeLabel}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <SummaryCard title="Total Loans Count" value={summary.totalLoans} />
            <SummaryCard
              title="Unique Items Borrowed"
              value={summary.uniqueItems}
            />
            <SummaryCard
              title="Most Popular Category"
              value={summary.topCategory}
            />
            <SummaryCard title="Most Popular Genre" value={summary.topGenre} />
            <SummaryCard
              title="Top Borrowed Item"
              value={summary.topItemTitle}
              subtitle={`${summary.topItemLoanCount} loans`}
            />
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
                  Filter By Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Book
                  </option>
                  <option>
                    Periodical
                  </option>
                  <option>
                    Audiovisual Media
                  </option>
                  <option>
                    Equipment
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Filter By Genre
                </label>
                <select
                  value={genreFilter}
                  onChange={(event) => setGenreFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
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
                  <option>
                    All
                  </option>
                  <option>
                    Title
                  </option>
                  <option>
                    Creator
                  </option>
                  <option>
                    Item ID
                  </option>
                  <option>
                    Category
                  </option>
                  <option>
                    Genre
                  </option>
                  <option>
                    Publisher
                  </option>
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
                  <option value="loanCount">
                    Loan Count
                  </option>
                  <option value="title">
                    Title
                  </option>
                  <option value="creator">
                    Creator
                  </option>
                  <option value="category">
                    Category
                  </option>
                  <option value="genre">
                    Genre
                  </option>
                  <option value="publisher">
                    Publisher
                  </option>
                  <option value="publicationDate">
                    Publication Date
                  </option>
                  <option value="itemId">
                    Item ID
                  </option>
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
                  <option value="desc">
                    Descending
                  </option>
                  <option value="asc">
                    Ascending
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton title="Reset Filters" onClick={ResetFilters} />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Popularity Detail Table
            </h2>

            <div className="mt-6 w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full table-fixed text-left text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 text-left text-sm text-slate-700 border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold w-[80px]">
                      Item ID
                    </th>
                    <th className="px-4 py-3 font-semibold w-[150px]">
                      Title
                    </th>
                    <th className="px-4 py-3 font-semibold w-[130px]">
                      Creator
                    </th>
                    <th className="px-4 py-3 font-semibold w-[110px]">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold w-[110px]">
                      Genre
                    </th>
                    <th className="px-4 py-3 font-semibold w-[120px]">
                      Publisher
                    </th>
                    <th className="px-4 py-3 font-semibold w-[120px]">
                      Publication Date
                    </th>
                    <th className="px-4 py-3 font-semibold w-[100px]">
                      Loan Count
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Summary
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-5 text-center font-medium text-slate-500 bg-white">
                        No popularity records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.itemId}
                        className="border-b border-slate-100 bg-white text-slate-600 hover:bg-slate-50 transition-colors align-top"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.itemId}
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-900 align-top">
                          <div className="break-words">
                            {item.title || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="break-words">
                            {item.creator || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          {NormalizeCategory(item.category)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="break-words">
                            {item.genre || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="break-words">
                            {item.publisher || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          {item.publicationDate
                            ? FormatDate(new Date(item.publicationDate), true)
                            : "-"}
                        </td>

                        <td className="px-4 py-3 font-bold text-sky-700 align-top">
                          {SafeNumber(item.loanCount)}
                        </td>

                        <td className="px-4 py-3 align-top text-slate-500">
                          <div className="break-words">
                            {item.summary || "-"}
                          </div>
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