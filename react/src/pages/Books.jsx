import { SubmitButton } from "../components/Buttons";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage } from "../api";
import { useEffect, useState } from "react";
import InputComponent from "../components/InputComponent";

export default function Books() {
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
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
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Book Entry
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Book Entry Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter book information below.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const bookData = {
              title: formData.get("title"),
              available: formData.get("available"),
              shelfnumber: formData.get("shelfnumber"),
              genre: formData.get("genre"),
              language: formData.get("language"),
              format: formData.get("format"),
              authorfirstname: formData.get("authorfirstname"),
              authorlastname: formData.get("authorlastname"),
              publisher: formData.get("publisher"),
              publicationdate: formData.get("publicationdate"),
              summary: formData.get("summary"),
            };

            try {
              await FetchJson("/api/itementry/book", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(bookData),
              });

              alert("Book entry successful!");
              e.target.reset();
            } catch (error) {
              console.error(error);
              alert(error.message || "Book entry failed.");
            }
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 grid-rows-6 gap-x-6 ">
              <div className="grid grid-cols-4 gap-x-6">
                <InputComponent
                  colspan={2}
                  pattern="(?=.*\S)[\s\S]{1,45}"
                  id="title"
                  label="Book Title"
                  min={1}
                  max={45}
                />
                <InputComponent
                  id="available"
                  label="Copies"
                  type="number"
                  min={1}
                  max={100}
                />
                <InputComponent
                  id="shelfnumber"
                  label="Shelf Number"
                  type="number"
                  min={1}
                  max={100}
                />
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

              <div className="grid grid-cols-2 gap-x-6">
                <InputComponent
                  pattern="(?=.*\S)[\s\S]{1,30}"
                  id="authorfirstname"
                  label="Author First Name"
                  min={1}
                  max={30}
                />
                <InputComponent
                  pattern="(?=.*\S)[\s\S]{1,30}"
                  id="authorlastname"
                  label="Author Last Name"
                  min={1}
                  max={30}
                />
              </div>
              <div className="grid grid-cols-3 gap-x-6">
                <InputComponent
                  colspan={2}
                  pattern="(?=.*\S)[\s\S]{1,50}"
                  id="publisher"
                  label="Publisher"
                  min={1}
                  max={50}
                />

                <InputComponent
                  id="publicationdate"
                  label="Publication Date"
                  type="date"
                />
              </div>
              <div>
                <InputComponent
                  colspan={3}
                  pattern="(?=.*\S)[\s\S]{1,1000}"
                  id="summary"
                  label="Summary"
                  type="textarea"
                  min={1}
                  max={1000}
                />
                {/* <div className="sm:col-span-3">
                  <label htmlFor="summary">Summary</label>
                  <div className="mt-2">
                    <textarea
                      required
                      pattern="(?=.*\S)[\s\S]{1,1000}"
                      id="summary"
                      name="summary"
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div> */}
              </div>
              <div className="grid justify-center mt-4">
                <SubmitButton title={"Submit"} value={"OK"} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
