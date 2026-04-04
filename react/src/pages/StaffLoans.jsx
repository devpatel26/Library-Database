import { useEffect, useMemo, useState } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

async function FetchCurrentStaffLoans() {
  return FetchJson("/api/staff/loans/current");
}

function SafeText(value) {
  return value == null ? "" : String(value);
}

export default function StaffLoans() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [returnPendingLoanId, setReturnPendingLoanId] = useState(null);
  const [lostPendingLoanId, setLostPendingLoanId] = useState(null);

  const user = ReadStoredUser();
  const userKey = user ? `${user.user_type ?? ""}:${user.staff_id ?? ""}` : "";
  const { showSuccess, showError, showWarning } = useMessage();

  useEffect(() => {
    const currentUser = ReadStoredUser();

    async function LoadLoans() {
      try {
        setIsLoading(true);
        setLoans(await FetchCurrentStaffLoans());
      } catch (error) {
        console.error(error);
        showError(error.message || "Failed to load loans.");
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
      showWarning("Only staff can access the staff loans page.");
      window.location.href = "/";
      return;
    }

    LoadLoans();
  }, [userKey, showError, showWarning]);

  async function ReloadLoans() {
    try {
      setIsLoading(true);
      setLoans(await FetchCurrentStaffLoans());
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to reload loans.");
    } finally {
      setIsLoading(false);
    }
  }

  async function ReturnLoan(loanId) {
    try {
      setReturnPendingLoanId(loanId);

      await FetchJson(`/api/loans/${loanId}/return`, {
        method: "POST",
      });

      showSuccess("Loan returned successfully!");
      await ReloadLoans();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to return loan.");
    } finally {
      setReturnPendingLoanId(null);
    }
  }

  async function MarkLoanAsLost(loanId) {
    try {
      setLostPendingLoanId(loanId);

      await FetchJson(`/api/loans/${loanId}/mark-lost`, {
        method: "POST",
      });

      showSuccess("Loan marked as lost successfully!");
      await ReloadLoans();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to mark loan as lost.");
    } finally {
      setLostPendingLoanId(null);
    }
  }

  const filteredLoans = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return loans;
    }

    return loans.filter((loan) => {
      const fields = {
        loanId: SafeText(loan.loanId),
        patronName: SafeText(loan.patronName),
        patronId: SafeText(loan.patronId),
        itemId: SafeText(loan.itemId),
        title: SafeText(loan.title),
        creator: SafeText(loan.creator),
      };

      if (searchBy === "all") {
        return Object.values(fields).join(" ").toLowerCase().includes(normalizedSearch);
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
  }, [loans, searchBy, searchText]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Current Loans
      </h1>

      <p className="mt-4 text-base leading-7 text-slate-300">
        View all active loans, search by selected fields, and manage returns or lost items.
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
            <option value="all">
              All
            </option>
            <option value="loanId">
              Loan ID
            </option>
            <option value="patronName">
              Patron Name
            </option>
            <option value="patronId">
              Patron ID
            </option>
            <option value="itemId">
              Item ID
            </option>
            <option value="title">
              Item Title
            </option>
            <option value="creator">
              Creator
            </option>
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
          <div className="text-slate-300">
            Loading loans...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-slate-300">
            No matching current loans found.
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isReturnPending = returnPendingLoanId === loan.loanId;
            const isLostPending = lostPendingLoanId === loan.loanId;
            const isBusy = isReturnPending || isLostPending;

            return (
              <div
                key={loan.loanId}
                className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 lg:grid-cols-4"
              >
                <div className="lg:col-span-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="text-xl font-bold text-white">
                      {loan.title}
                    </div>
                    <div className="text-sm text-slate-400">
                      Loan ID: {loan.loanId}
                    </div>
                    <div className="text-sm text-slate-400">
                      Item ID: {loan.itemId}
                    </div>
                  </div>

                  {loan.creator ? (
                    <div className="mt-1 text-sky-300">
                      {loan.creator}
                    </div>
                  ) : null}

                  <div className="mt-2 text-slate-300">
                    Borrowed by: {loan.patronName} (Patron ID: {loan.patronId})
                  </div>

                  <div className="mt-1 text-slate-400">
                    Loan date: {loan.loanStart ? FormatDate(new Date(loan.loanStart), true) : "-"}
                  </div>

                  <div className="text-slate-400">
                    Due date: {loan.loanEnd ? FormatDate(new Date(loan.loanEnd), true) : "-"}
                  </div>
                </div>

                <div className="flex flex-col items-start justify-center gap-3 lg:items-end">
                  <PrimaryButton
                    title={isReturnPending ? "Returning..." : "Return"}
                    disabledValue={isBusy}
                    onClick={() => ReturnLoan(loan.loanId)}
                  />
                  <SecondaryButton
                    title={isLostPending ? "Marking..." : "Mark as Lost"}
                    disabled={isBusy}
                    onClick={() => MarkLoanAsLost(loan.loanId)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}