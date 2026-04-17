import { SubmitButton } from "../components/Buttons";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage, UploadImageFile } from "../api";
import { useMessage } from "../hooks/useMessage";
import { useEffect, useState } from "react";
import FileUploadField from "../components/FileUploadField";

export default function AudiovisualMedia() {
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useMessage();

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
    <section className="rounded-xl bg-slate-100/40 border border-gray-100 p-2 inset-shadow-sm">
      <div className="flex text-center items-center justify-between align-center flex-wrap">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Audiovisual Media Entry
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Enter audiovisual media information below.
        </p>
      </div>

      <div className="mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            let coverImageUrl = "";

            try {
              setSubmitting(true);
              if (selectedImageFile) {
                const uploadResult = await UploadImageFile(selectedImageFile);
                coverImageUrl =
                  String(uploadResult?.url ?? "").trim() || coverImageUrl;
              }

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
                coverImageUrl,
              };

              await FetchJson("/api/itementry/audiovisual_media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(avmData),
              });

              showSuccess("AVM entry successful!");
              setTimeout(() => {
                window.location.reload();
              }, 800);
            } catch (error) {
              showError(error.message || "AVM entry failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-6">
            {/* Title Section */}
            <div>
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
                placeholder="Media Title"
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Numeric Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div>
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
                  placeholder="1"
                  min="1"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="shelfnumber"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Shelf Number
                </label>
                <input
                  required
                  type="number"
                  id="shelfnumber"
                  name="shelfnumber"
                  placeholder="1"
                  min="1"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="Shelf No."
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Runtime (Mins)
                </label>
                <input
                  required
                  type="number"
                  id="runtime"
                  name="runtime"
                  placeholder="Minutes"
                  min="1"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Dropdowns */}
            {loading && !error && (
              <div className="grid grid-cols-3 gap-6">
                <DisabledDropdown name="genres" />
                <DisabledDropdown name="languages" />
                <DisabledDropdown name="formats" />
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
                  placeholder="Company Name"
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="col-span-1">
                <label
                  htmlFor="publicationdate"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Publication Date
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
                label="Upload Cover Image (Optional)"
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
                rows="4"
                placeholder="Brief description of the media..."
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Submit Button Area */}
            <div className="pt-4 flex justify-center">
              <SubmitButton
                title={submitting ? "Saving..." : "Submit Entry"}
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
