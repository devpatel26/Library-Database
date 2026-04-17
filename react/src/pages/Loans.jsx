import { useEffect, useState } from "react";
import { ItemHold, ItemHolder, ItemImage, ItemLoan } from "../components/Items";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";
import { FormatDate } from "../components/TimeFormats";

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
    <div className="rounded-3xl bg-white px-3 py-1.5 outline-2 -outline-offset-1 outline-slate-200/60">
      <div className="grid grid-cols-4">
        <div className="col-span-3 m-2 flex gap-4">
          <ItemImage itemData={itemData} />
          <ItemHolder data={itemData} />
        </div>
        <div className="col-span-1 grid grid-rows-3 items-center text-center text-sm text-slate-600">
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
    <section className="space-y-2 pt-2 rounded-xl bg-slate-100/40  border border-gray-100 p-4 inset-shadow-sm ">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
        Borrowing
      </h2>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">Loans</h3>
      {loading && <p className="mt-2 text-slate-600">Loading circulation...</p>}
      {!loading && error && <p className="mt-2 text-rose-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-2 space-y-8">
          <div>
            <div className="mt-2 flex flex-wrap justify-evenly gap-4">
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
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Holds</h3>
            <div className="mt-2 flex flex-wrap justify-evenly gap-4">
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
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              History
            </h3>
            <div className="mt-2 space-y-4">
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
