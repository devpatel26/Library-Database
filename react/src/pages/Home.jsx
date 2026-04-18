import { CarouselItem } from "../components/Items";
import { useEffect, useState } from "react";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";

async function FetchCirculationData() {
  const payload = await FetchJson("/api/mainitems");

  return {
    books: payload.books ?? [],
    periodicals: payload.periodicals ?? [],
    audiovisualmedia: payload.audiovisualmedia ?? [],
    equipment: payload.equipment ?? [],
  };
}

export default function Home() {
  const user = ReadStoredUser();

  const welcomeName = user?.first_name
    ? `Welcome back, ${user.first_name}.`
    : "Welcome to Datahaven Library.";

  const [data, setData] = useState({ loans: [], holds: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function LoadCirculation() {
      try {
        setLoading(true);
        setError("");
        setData(await FetchCirculationData());
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load items."));
      } finally {
        setLoading(false);
      }
    }

    LoadCirculation();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {welcomeName}
      </h1>
      <p className="text-sm text-slate-600">
        Browse the latest additions across the collection.
      </p>

      <div className="mt-2 space-y-4">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Recent Books</h2>
          <div className="rounded-2xl mt-1 flex flex-wrap justify-center gap-8 bg-slate-100 inset-shadow-sm p-4">
            {loading && <p className="text-slate-600">Loading books...</p>}
            {!loading && error && <p className="text-rose-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap justify-evenly gap-4">
                    {data.books.map((book) => (
                      <CarouselItem
                        key={`book-${book.itemId}`}
                        itemData={book}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Periodicals
          </h2>
          <div className="rounded-2xl mt-1 flex flex-wrap justify-center gap-8 bg-slate-100 inset-shadow-sm p-4">
            {loading && (
              <p className="text-slate-600">Loading periodicals...</p>
            )}
            {!loading && error && <p className="text-rose-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap justify-evenly gap-4">
                    {data.periodicals.map((periodicals) => (
                      <CarouselItem
                        key={`periodicals-${periodicals.itemId}`}
                        itemData={periodicals}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Recent Media</h2>
          <div className="rounded-2xl mt-1 flex flex-wrap justify-center gap-8 bg-slate-100 inset-shadow-sm p-4">
            {loading && <p className="text-slate-600">Loading media...</p>}
            {!loading && error && <p className="text-rose-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap justify-evenly gap-4">
                    {data.audiovisualmedia.map((audiovisualmedia) => (
                      <CarouselItem
                        key={`audiovisualmedia-${audiovisualmedia.itemId}`}
                        itemData={audiovisualmedia}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Equipment
          </h2>
          <div className="rounded-2xl mt-1 flex flex-wrap justify-center gap-8 bg-slate-100 inset-shadow-sm p-4">
            {loading && <p className="text-slate-600">Loading equipment...</p>}
            {!loading && error && <p className="text-rose-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap justify-evenly gap-4">
                    {data.equipment.map((equipment) => (
                      <CarouselItem
                        key={`equipment-${equipment.itemId}`}
                        itemData={equipment}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
