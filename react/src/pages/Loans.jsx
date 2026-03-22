import { useEffect, useState } from "react";
import { ItemHold, ItemLoan } from "../components/Items";
import { FetchJson, GetErrorMessage } from "../api";

export default function Loans() {
  const [data, setData] = useState({ loans: [], holds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function LoadCirculation() {
      try {
        setLoading(true);
        setError("");
        const payload = await FetchJson("/api/loans", { credentials: "include" });

        setData({
          loans: payload.loans ?? [],
          holds: payload.holds ?? [],
        });
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load loans."));
      } finally {
        setLoading(false);
      }
    }

    LoadCirculation();
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Loans
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Loans Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Patron loan details will appear here.
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
                  <ItemHold key={item.holdId} itemData={item} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
