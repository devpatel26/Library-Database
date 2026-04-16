import { SubmitButton } from "../components/Buttons";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";
import { FetchJson, GetErrorMessage, UploadImageFile } from "../api";
import { useEffect, useState } from "react";
import InputComponent from "../components/InputComponent";
import FileUploadField from "../components/FileUploadField";
import { useMessage } from "../hooks/useMessage";

export default function Books() {
  const { showSuccess, showError } = useMessage();
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [format, setFormat] = useState([]);
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
    <section>
      <h2 className="text-3xl font-bold text-slate-900">Book Entry</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Enter book information below.
      </p>

      <div className="mt-8">
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
                coverImageUrl,
              };

              await FetchJson("/api/itementry/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData),
              });

              showSuccess("Book entry successful!");
              setTimeout(() => {
                window.location.reload();
              }, 800);
            } catch (error) {
              showError(error.message || "Book entry failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <InputComponent
                colspan={2}
                pattern="(?=.*\S)[\s\S]{1,45}"
                id="title"
                label="Title"
                placeholder="Enter title"
              />
              <InputComponent
                id="available"
                label="Copies"
                type="number"
                placeholder="0"
              />
              <InputComponent
                id="shelfnumber"
                label="Shelf"
                type="number"
                placeholder="No."
              />
            </div>

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

            <div className="grid grid-cols-2 gap-6">
              <InputComponent
                id="authorfirstname"
                label="Author First Name"
                placeholder="First Name"
              />
              <InputComponent
                id="authorlastname"
                label="Author Last Name"
                placeholder="Last Name"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <InputComponent
                colspan={2}
                id="publisher"
                label="Publisher"
                placeholder="Publishing Co."
              />
              <InputComponent
                id="publicationdate"
                label="Publication Date"
                type="date"
              />
            </div>

            <InputComponent
              colspan={3}
              id="summary"
              label="Summary"
              type="textarea"
              placeholder="Brief summary of the book..."
            />

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

            <div className="pt-4 flex justify-center">
              <SubmitButton
                title={submitting ? "Saving..." : "Submit Book"}
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
