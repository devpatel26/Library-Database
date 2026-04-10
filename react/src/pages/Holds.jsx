import { useEffect, useMemo, useState } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

async function FetchCurrentHolds() {
  return FetchJson("/api/holds/current");
}

function SafeText(value) {
  return value == null ? "" : String(value);
}

export default function Holds() {
  const { showSuccess, showError, showWarning } = useMessage();
  const user = ReadStoredUser();

  const [holds, setHolds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const currentUser = ReadStoredUser();

    async function LoadHolds() {
      try {
        setIsLoading(true);
        setHolds(await FetchCurrentHolds());
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load holds.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!currentUser) {
      showWarning("Please log in first.");
      window.location.href = "/login";
      return;
    }

    if (currentUser.user_type !== "staff") {
      showWarning("Only staff can access the holds page.");
      window.location.href = "/";
      return;
    }

    LoadHolds();
  }, [user?.staff_id, user?.user_type, showError, showWarning]);

  async function ReloadHolds() {
    try {
      setIsLoading(true);
      setHolds(await FetchCurrentHolds());
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to reload holds.");
    } finally {
      setIsLoading(false);
    }
  }

  async function CancelHold(holdId) {
    try {
      await FetchJson(`/api/holds/${holdId}`, {
        method: "DELETE",
      });

      showSuccess("Hold cancelled successfully!");
      await ReloadHolds();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to cancel hold.");
    }
  }

  async function CheckoutHold(holdId) {
    try {
      await FetchJson(`/api/holds/${holdId}/checkout`, {
        method: "POST",
      });

      showSuccess("Hold checked out successfully!");
      await ReloadHolds();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to check out hold.");
    }
  }

  const filteredHolds = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return holds;
    }

    return holds.filter((hold) => {
      const fields = {
        holdId: SafeText(hold.holdId),
        patronName: SafeText(hold.patronName),
        patronId: SafeText(hold.patronId),
        itemId: SafeText(hold.itemId),
        title: SafeText(hold.title),
        creator: SafeText(hold.creator),
      };

      if (searchBy === "all") {
        return Object.values(fields)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      }

      const value = SafeText(fields[searchBy]).toLowerCase();

      if (
        searchBy === "loanId" ||
        searchBy === "patronId" ||
        searchBy === "itemId" ||
        searchBy === "fineId" ||
        searchBy === "holdId"
      ) {
        return value === normalizedSearch;
      }

      return value.includes(normalizedSearch);
    });
  }, [holds, searchBy, searchText]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Current Holds
      </h1>

      <p className="mt-4 text-base leading-7 text-slate-300">
        View all active holds, search by selected fields, cancel them, or
        convert them into loans.
      </p>

      <div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Search By
          </label>
          <select
            value={searchBy}
            onChange={(event) => setSearchBy(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option value="all">All</option>
            <option value="holdId">Hold ID</option>
            <option value="patronName">Patron Name</option>
            <option value="patronId">Patron ID</option>
            <option value="itemId">Item ID</option>
            <option value="title">Item Title</option>
            <option value="creator">Creator</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Search Text
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Enter search text..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-slate-300">Loading holds...</div>
        ) : filteredHolds.length === 0 ? (
          <div className="text-slate-300">No matching current holds found.</div>
        ) : (
          filteredHolds.map((hold) => (
            <div
              key={hold.holdId}
              className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 lg:grid-cols-4"
            >
              <div className="lg:col-span-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="text-xl font-bold text-white">
                    {hold.title}
                  </div>
                  <div className="text-sm text-slate-400">
                    Hold ID: {hold.holdId}
                  </div>
                  <div className="text-sm text-slate-400">
                    Item ID: {hold.itemId}
                  </div>
                </div>

                {hold.creator ? (
                  <div className="mt-1 text-sky-300">{hold.creator}</div>
                ) : null}

                <div className="mt-2 text-slate-300">
                  Held by: {hold.patronName} (Patron ID: {hold.patronId})
                </div>

                <div className="mt-1 text-slate-400">
                  Hold date:{" "}
                  {hold.holdStart
                    ? FormatDate(new Date(hold.holdStart), true)
                    : "-"}
                </div>

                <div className="text-slate-400">
                  Expires:{" "}
                  {hold.holdEnd
                    ? FormatDate(new Date(hold.holdEnd), true)
                    : "-"}
                </div>
              </div>

              <div className="flex flex-col items-start justify-center gap-3 lg:items-end">
                <SecondaryButton
                  title="Cancel Hold"
                  onClick={() => CancelHold(hold.holdId)}
                />
                <PrimaryButton
                  title="Check Out"
                  onClick={() => CheckoutHold(hold.holdId)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
