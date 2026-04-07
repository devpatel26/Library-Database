import { useState } from "react";
import { SubmitButton } from "../components/Buttons";
import Item from "../components/Items";
import { FetchJson } from "../api";

export default function Search() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function HandleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    if (!q) {
      setError("Enter a search term.");
      setResults([]);
      return;
    }

    const params = new URLSearchParams({
      q,
      category: String(formData.get("category") ?? "book"),
      availableOnly: String(formData.get("availableOnly") === "on"),
      limit: "20",
    });

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);
      const data = await FetchJson(`/api/search?${params.toString()}`);

      setResults(data.results ?? []);
    } catch (err) {
      setResults([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Search Page
      </h1>
      <form onSubmit={HandleSubmit}>
        <div className="grid gap-x-6 gap-y-12 grid-cols-8 mt-2">
          <div className="sm:col-span-4">
            <label htmlFor="q">Search Term</label>
            <div className="mt-2">
              <input
                required
                id="q"
                name="q"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="category">Category</label>
            <div className="mt-2">
              <select
                required
                id="category"
                name="category"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option
                  value="book"
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                >
                  Book
                </option>
                <option
                  value="audiovisualmedia"
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                >
                  Audiovisual Media
                </option>
                <option
                  value="periodical"
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                >
                  Periodicals
                </option>
                <option
                  value="equipment"
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                >
                  Equipment
                </option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-1 grid">
            <label htmlFor="availableOnly">Available Only</label>
            <div className="mt-2 mt-2 scale-150">
              <input
                type="checkbox"
                id="availableOnly"
                name="availableOnly"
                className="block w-full rounded-md bg-white/5 px-3 m:text-sm/6"
              />
            </div>
          </div>

          <div className="grid justify-items-start col-span-1 items-end">
            <SubmitButton title={"Search"} value={"OK"} />
          </div>
        </div>
      </form>
      <div id="results" className="flex gap-6 flex-wrap justify-evenly mt-6">
        {loading && <p className="text-slate-300">Searching...</p>}
        {!loading && error && <p className="text-rose-300">{error}</p>}
        {!loading && !error && hasSearched && results.length === 0 && (
          <p className="text-slate-300">No results found.</p>
        )}
        {!loading &&
          !error &&
          results.map((item) => (
            <Item key={`${item.category}-${item.itemId}`} itemData={item} />
          ))}
      </div>
    </section>
  );
}
