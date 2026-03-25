import { useEffect, useState } from "react";
import { ItemHold, ItemHolder, ItemLoan } from "../components/Items";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";

async function FetchCirculationData() {
  const payload = await FetchJson("/api/loans");

  return {
    loans: payload.loans ?? [],
    holds: payload.holds ?? [],
    history: payload.history ?? [],
  };
}

function LoanHistoryCard({ itemData }) {
  return (
    <div className="rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      <div className="grid grid-cols-4">
        <div className="col-span-3 m-2">
          <ItemHolder data={itemData} />
        </div>
        <div className="col-span-1 grid grid-rows-3 items-center text-center text-sm text-slate-300">
          <div>Borrowed: {itemData.loanStart}</div>
          <div>Due: {itemData.loanEnd}</div>
          <div>Status: {itemData.loanStatus ?? "Completed"}</div>
        </div>
      </div>
    </div>
  );
}

export default function Loans() {
  const [data, setData] = useState({ loans: [], holds: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";

  useEffect(() => {
    const currentUser = ReadStoredUser();

    async function LoadCirculation() {
      if (!currentUser) {
        setData({ loans: [], holds: [], history: [] });
        setError("Please log in to view loans.");
        setLoading(false);
        return;
      }

      if (currentUser.user_type !== "patron") {
        setData({ loans: [], holds: [], history: [] });
        setError("Loans are currently only available for patron accounts.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setData(await FetchCirculationData());
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load loans."));
      } finally {
        setLoading(false);
      }
    }

    LoadCirculation();
  }, [userKey]);

  async function CancelHold(holdId) {
    try {
      await FetchJson(`/api/holds/${holdId}`, {
        method: "DELETE",
      });

      setLoading(true);
      setError("");
      setData(await FetchCirculationData());
    } catch (err) {
      setError(GetErrorMessage(err, "Failed to cancel hold."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Loans
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Patron Loans
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Track current loans, active holds, and your completed borrowing history.
      </p>

      {loading && <p className="mt-4 text-slate-300">Loading circulation...</p>}
      {!loading && error && <p className="mt-4 text-rose-300">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              Loans
            </p>
            <div className="mt-4 flex flex-wrap justify-evenly gap-4">
              {data.loans.length === 0 ? (
                <p className="text-slate-300">No current loans.</p>
              ) : (
                data.loans.map((item) => (
                  <ItemLoan key={item.loanId} itemData={item} />
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              Holds
            </p>
            <div className="mt-4 flex flex-wrap justify-evenly gap-4">
              {data.holds.length === 0 ? (
                <p className="text-slate-300">
                  No active holds.
                </p>
              ) : (
                data.holds.map((item) => (
                  <ItemHold
                    key={item.holdId}
                    itemData={item}
                    onCancel={CancelHold}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              Borrowing History
            </p>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Completed loans are listed here. This database does not store a
              separate return timestamp, so history is shown from the loan
              record itself.
            </p>
            <div className="mt-4 space-y-4">
              {data.history.length === 0 ? (
                <p className="text-slate-300">No completed loans found.</p>
              ) : (
                data.history.map((item) => (
                  <LoanHistoryCard key={item.loanId} itemData={item} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
