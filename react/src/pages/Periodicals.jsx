import { SubmitButton } from "../components/Buttons";
import Dropdown from "../components/Dropdown";
import { useMessage } from "../hooks/useMessage";
// import languages, { bookformats, genres } from "../data/dummy/formdropdowns";

import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage } from "../api";
import { useEffect, useState } from "react";

export default function Periodicals() {
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
  const { showSuccess, showError, showWarning } = useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function LoadDropdowns() {
      try {
        setLoading(true);
        const languageData = await FetchJson("/api/languages");
        setLanguages(languageData);
        const genreData = await FetchJson("/api/genres");
        setGenres(genreData);
        const formatData = await FetchJson("/api/book_types");
        setFormat(formatData);
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load dropdowns."));
      } finally {
        setLoading(false);
      }
    }
    LoadDropdowns();
  }, []);
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <h2 className="text-3xl font-bold text-white">Periodical Entry</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter periodical information below.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const title = formData.get("title");
            const publisher = formData.get("publisher");
            const publicationdate = formData.get("publicationdate");
            const available = formData.get("available");
            const shelfnumber = formData.get("shelfnumber");

            if (
              !title ||
              !publisher ||
              !publicationdate ||
              !available ||
              !shelfnumber
            ) {
              showWarning("Please fill in all required fields.");
              return;
            }

            const periodicalData = {
              title: formData.get("title"),
              available: formData.get("available"),
              shelfnumber: formData.get("shelfnumber"),
              genre: formData.get("genre"),
              language: formData.get("language"),
              format: formData.get("format"),
              publisher: formData.get("publisher"),
              publicationdate: formData.get("publicationdate"),
              summary: formData.get("summary"),
            };

            try {
              await FetchJson("/api/itementry/periodical", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(periodicalData),
              });

              showSuccess("Periodical entry successful!");
              e.target.reset();
            } catch (error) {
              console.error(error);
              showError(error.message || "Periodical entry failed.");
            }
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 grid-rows-5 gap-x-6 ">
              <div className="grid grid-cols-4 gap-x-6">
                <div className="sm:col-span-2">
                  <label htmlFor="title">Title</label>
                  <div className="mt-2">
                    <input
                      required
                      id="title"
                      name="title"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="available">Copies</label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      id="available"
                      name="available"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="shelfnumber">Shelf Number</label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      id="shelfnumber"
                      name="shelfnumber"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {loading && !error && (
                <div className="grid grid-cols-3 gap-x-6">
                  <DisabledDropdown name="genre" />
                  <DisabledDropdown name="language" />
                  <DisabledDropdown name="format" />
                </div>
              )}
              {!loading && error && (
                <div className="grid grid-cols-3 gap-x-6">
                  Error encountered; please reload.
                </div>
              )}
              {!loading && !error && (
                <div className="grid grid-cols-3 gap-x-6">
                  <ObjectDropdown name="genre" options={genres} />
                  <ObjectDropdown name="language" options={languages} />
                  <ObjectDropdown name="format" options={format} />
                </div>
              )}
              <div className="grid grid-cols-3 gap-x-6">
                <div className="col-span-2">
                  <label htmlFor="publisher">Publisher</label>
                  <div className="mt-2">
                    <input
                      required
                      id="publisher"
                      name="publisher"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label htmlFor="publicationdate">Publication Date</label>
                  <div className="mt-2">
                    <input
                      required
                      id="publicationdate"
                      name="publicationdate"
                      type="date"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="sm:col-span-3">
                  <label htmlFor="summary">Summary</label>
                  <div className="mt-2">
                    <textarea
                      required
                      id="summary"
                      name="summary"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center items-center w-full">
                <SubmitButton title={"Submit"} value={"OK"} halfwidth={true} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
