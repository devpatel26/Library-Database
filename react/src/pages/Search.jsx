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
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
        Search Catalog
      </h1>

      <form onSubmit={HandleSubmit} className="space-y-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-12 items-end">
          {/* Search Term */}
          <div className="md:col-span-5">
            <label
              htmlFor="q"
              className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
            >
              Search Term
            </label>
            <input
              required
              id="q"
              name="q"
              placeholder="Title, author, or keywords..."
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <label
              htmlFor="category"
              className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
            >
              Category
            </label>
            <select
              required
              id="category"
              name="category"
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none cursor-pointer"
            >
              <option value="book">Books</option>
              <option value="audiovisualmedia">Audiovisual Media</option>
              <option value="periodical">Periodicals</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          {/* Available Only Toggle */}
          <div className="md:col-span-2 flex items-center justify-center pb-2">
            <label
              htmlFor="availableOnly"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                id="availableOnly"
                name="availableOnly"
                className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wide group-hover:text-sky-600 transition-colors">
                Available Only
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <SubmitButton title={"Search"} value={"OK"} fullwidth={true} />
          </div>
        </div>
      </form>

      {/* Results */}
      <div id="results" className="pr-3 mt-6 pt-6 border-t border-slate-100">
        {loading && (
          <div className="flex justify-center items-center py-4">
            <p className="text-slate-500 font-medium animate-pulse">
              Searching the catalog...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="pr-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="pr-3 text-center py-4">
            <p className="text-slate-400 italic text-lg">
              No items match your search criteria.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="pr-3 flex gap-4 flex-wrap justify-evenly max-h-screen overflow-auto  pr-3">
            {results.map((item) => (
              <Item key={`${item.category}-${item.itemId}`} itemData={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
