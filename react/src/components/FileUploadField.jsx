export default function FileUploadField({
  id,
  label,
  selectedFileName = "",
  accept = "",
  onChange,
}) {
  const statusText = selectedFileName || "No file selected.";

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-200">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-4 rounded-md border border-white/10 bg-white/5 px-3 py-2">
        <label
          htmlFor={id}
          className="inline-flex shrink-0 cursor-pointer rounded-md bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-white"
        >
          Browse...
        </label>
        <span className="min-w-0 truncate text-sm text-slate-300">
          {statusText}
        </span>
        <input
          id={id}
          name={id}
          type="file"
          accept={accept}
          onChange={onChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
