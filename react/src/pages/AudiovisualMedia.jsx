import { SubmitButton } from "../components/Buttons";
// import Dropdown from "../components/Dropdown";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage } from "../api";
import { useMessage } from "../hooks/useMessage";
import { useEffect, useState } from "react";
// import languages, { avmformats, genres } from "../data/dummy/formdropdowns";

export default function AudiovisualMedia() {
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showSuccess, showError, /*showWarning*/} = useMessage();
  useEffect(() => {
    async function LoadDropdowns() {
      try {
        setLoading(true);
        const languageData = await FetchJson("/api/languages");
        setLanguages(languageData);
        const genreData = await FetchJson("/api/genres");
        setGenres(genreData);
        const formatData = await FetchJson("/api/audiovisual_media_types");
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
      <h2 className="text-3xl font-bold text-white">Audiovisual Media Entry</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter audiovisual media information below.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const avmData = {
              title: formData.get("title"),
              available: formData.get("available"),
              shelfnumber: formData.get("shelfnumber"),
              runtime: formData.get("runtime"),
              genre: formData.get("genre"),
              language: formData.get("language"),
              format: formData.get("format"),
              publisher: formData.get("publisher"),
              publicationdate: formData.get("publicationdate"),
              summary: formData.get("summary"),
            };

            try {
              await FetchJson("/api/itementry/audiovisual_media", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(avmData),
              });

            showSuccess("AVM entry successful!");
                setTimeout(() => {
                  window.location.reload();
                }, 800);
            } catch (error) {
              console.error(error);
              showError(error.message || "AVM entry failed.");
            }
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 grid-rows-5 gap-x-6 ">
              <div>
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
              </div>
              <div className="grid grid-cols-3 gap-x-6">
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

                <div className="sm:col-span-1">
                  <label htmlFor="runtime">Runtime</label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      id="runtime"
                      name="runtime"
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
