export default function PrimaryButton({
  title,
  disabledValue = false,
  onClick,
  type = "button",
}) {
  return (
    <div className="inline">
      <button
        type={type}
        disabled={disabledValue}
        onClick={onClick}
        className="rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {title}
      </button>
    </div>
  );
}

export function SubmitButton({
  title,
  disabledValue = false,
  onClick,
  fullwidth = false,
  halfwidth = false,
}) {
  return (
    <div className={fullwidth ? "w-full" : halfwidth ? "w-1/2" : null}>
      <button
        type="submit"
        disabled={disabledValue}
        onClick={onClick}
        className="w-full rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {title}
      </button>
    </div>
  );
}

export function SecondaryButton({ title, onClick, disabled = false }) {
  return (
    <div className="inline">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {title}
      </button>
    </div>
  );
}
