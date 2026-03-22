import Fine from "../components/Fine";
import { useEffect, useState } from "react";
import { FetchJson, GetErrorMessage } from "../api";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function LoadFines() {
      try {
        setLoading(true);
        setError("");
        const data = await FetchJson("/api/fines", { credentials: "include" });

        setFines(data);
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load fines."));
      } finally {
        setLoading(false);
      }
    }

    LoadFines();
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Fines
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fine Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Lists of fines can be found here.
      </p>

      {loading && <p className="mt-4 text-slate-300">Loading fines...</p>}
      {!loading && error && <p className="mt-4 text-rose-300">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 flex flex-wrap justify-evenly gap-4">
          {fines.length === 0 ? (
            <p className="text-slate-300">
              No fines found.
            </p>
          ) : (
            fines.map((item) => <Fine key={item.fineId} data={item} />)
          )}
        </div>
      )}
    </section>
  );
}
