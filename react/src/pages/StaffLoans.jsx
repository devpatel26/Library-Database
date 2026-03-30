import { useEffect, useState } from "react";
import PrimaryButton from "../components/Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatTime, FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

async function FetchCurrentStaffLoans() {
  return FetchJson("/api/staff/loans/current");
}

export default function StaffLoans() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = ReadStoredUser();
  const userKey = user ? `${user.user_type ?? ""}:${user.staff_id ?? ""}` : "";
  const { showSuccess, showError, showWarning, /*showInfo */} = useMessage();

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

  async function ReturnLoan(loanId) {
    try {
      await FetchJson(`/api/loans/${loanId}/return`, {
        method: "POST",
      });

      showSuccess("Loan returned successfully!");
      setIsLoading(true);
      setLoans(await FetchCurrentStaffLoans());
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to return loan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Current Loans
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View all active loans and return checked out items.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-slate-300">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="text-slate-300">No current loans found.</div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.loanId}
              className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 md:grid-cols-4"
            >
              <div className="md:col-span-2">
                <div className="text-xl font-bold text-white">{loan.title}</div>
                {loan.creator ? (
                  <div className="text-sky-300">{loan.creator}</div>
                ) : null}
                <div className="mt-2 text-slate-300">
                  Borrowed by: {loan.patronName} (Patron ID: {loan.patronId})
                </div>
                <div className="text-slate-400">
                  Loan date: {FormatDate(new Date(loan.loanStart), true)}
                </div>
                <div className="text-slate-400">
                  Due date: {FormatDate(new Date(loan.loanEnd), true)}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-center gap-3">
                <PrimaryButton
                  title="Return"
                  onClick={() => ReturnLoan(loan.loanId)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
