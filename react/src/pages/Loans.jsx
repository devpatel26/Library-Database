import { useEffect, useState } from "react";
import { ItemHold, ItemHolder, ItemLoan } from "../components/Items";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";
import { FormatTime, FormatDate } from "../components/TimeFormats";

async function FetchCirculationData() {
  const payload = await FetchJson("/api/loans");

  return {
    loans: payload.loans ?? [],
    holds: payload.holds ?? [],
    history: payload.history ?? [],
  };
}

function LoanHistoryCard({ itemData }) {
  const formattedLoanStart = FormatDate(new Date(itemData.loanStart), true);
  const formattedLoanEnd = FormatDate(new Date(itemData.loanEnd), true);
  return (
    <div className="rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      <div className="grid grid-cols-4">
        {itemData.category != "equipment" ? (
          <div className="col-span-3 m-2 flex gap-4">
            <img src="../public/Datahaven.jpg" className="h-48 w-36" />
            <ItemHolder data={itemData} />
          </div>
        ) : (
          <div className="col-span-3 m-2">
            <ItemHolder data={itemData} />
          </div>
        )}
        <div className="col-span-1 grid grid-rows-3 items-center text-center text-sm text-slate-300">
          <div>Borrowed: {formattedLoanStart}</div>
          <div>Due: {formattedLoanEnd}</div>
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
    <section>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Borrowing
      </h2>
      <h3 className=" mt-2 text-lg font-semibold text-sky-300">Loans</h3>
      {loading && <p className="mt-4 text-slate-300">Loading circulation...</p>}
      {!loading && error && <p className="mt-4 text-rose-300">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-8">
          <div>
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
            <h3 className=" mt-2 text-lg font-semibold text-sky-300">Holds</h3>
            <div className="mt-4 flex flex-wrap justify-evenly gap-4">
              {data.holds.length === 0 ? (
                <p className="text-slate-300">No active holds.</p>
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
            <h3 className=" mt-2 text-lg font-semibold text-sky-300">
              History
            </h3>
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
