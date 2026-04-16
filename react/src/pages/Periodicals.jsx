import { SubmitButton } from "../components/Buttons";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage, UploadImageFile } from "../api";
import { useMessage } from "../hooks/useMessage";
import { useEffect, useState } from "react";
import FileUploadField from "../components/FileUploadField";

export default function Periodicals() {
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
  const { showSuccess, showError, showWarning } = useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function LoadDropdowns() {
      try {
        setLoading(true);
        const languageData = await FetchJson("/api/languages");
        setLanguages(languageData);
        const genreData = await FetchJson("/api/genres");
        setGenres(genreData);
        const formatData = await FetchJson("/api/periodical_types");
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
    <section>
      <h2 className="text-3xl font-bold text-slate-900">Periodical Entry</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Enter periodical information below.
      </p>

      <div className="mt-8">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            let coverImageUrl = "";

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

            try {
              setSubmitting(true);
              if (selectedImageFile) {
                const uploadResult = await UploadImageFile(selectedImageFile);
                coverImageUrl =
                  String(uploadResult?.url ?? "").trim() || coverImageUrl;
              }

              const periodicalData = {
                title,
                available,
                shelfnumber,
                genre: formData.get("genre"),
                language: formData.get("language"),
                format: formData.get("format"),
                publisher,
                publicationdate,
                summary: formData.get("summary"),
                coverImageUrl,
              };

              await FetchJson("/api/itementry/periodical", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(periodicalData),
              });

              showSuccess("Periodical entry successful!");
              e.target.reset();
              setSelectedImageFile(null);
              setSelectedImageName("");
            } catch (error) {
              showError(error.message || "Periodical entry failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-6">
            {/* Header Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Title
                </label>
                <input
                  required
                  id="title"
                  name="title"
                  placeholder="Periodical Title"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="col-span-1">
                <label
                  htmlFor="available"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Copies
                </label>
                <input
                  required
                  type="number"
                  id="available"
                  name="available"
                  placeholder="Copy Count"
                  min="1"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="col-span-1">
                <label
                  htmlFor="shelfnumber"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Shelf
                </label>
                <input
                  required
                  type="number"
                  id="shelfnumber"
                  name="shelfnumber"
                  placeholder="Shelf No."
                  min="1"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Dropdowns */}
            {loading && !error && (
              <div className="grid grid-cols-3 gap-6">
                <DisabledDropdown name="genre" />
                <DisabledDropdown name="language" />
                <DisabledDropdown name="format" />
              </div>
            )}
            {!loading && error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-3 gap-6">
                <ObjectDropdown name="genre" options={genres} />
                <ObjectDropdown name="language" options={languages} />
                <ObjectDropdown name="format" options={format} />
              </div>
            )}

            {/* Publisher Info */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <label
                  htmlFor="publisher"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Publisher
                </label>
                <input
                  required
                  id="publisher"
                  name="publisher"
                  placeholder="Publishing Co."
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="col-span-1">
                <label
                  htmlFor="publicationdate"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Release Date
                </label>
                <input
                  required
                  id="publicationdate"
                  name="publicationdate"
                  type="date"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 bg-slate-50/50">
              <FileUploadField
                id="coverImageFile"
                label="Cover Image"
                accept="image/*"
                selectedFileName={selectedImageName}
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setSelectedImageFile(nextFile);
                  setSelectedImageName(nextFile?.name ?? "");
                }}
              />
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
              >
                Summary
              </label>
              <textarea
                required
                id="summary"
                name="summary"
                rows="3"
                placeholder="Brief description..."
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-center">
              <SubmitButton
                title={submitting ? "Processing..." : "Submit Periodical"}
                value={"OK"}
                halfwidth={true}
                disabledValue={submitting}
              />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
