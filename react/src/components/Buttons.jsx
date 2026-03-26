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
        className="rounded-md bg-indigo-800 px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 m-1 hover:bg-indigo-500 disabled:bg-indigo-1000"
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
        className="w-full rounded-md bg-indigo-800 px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 m-1 hover:bg-indigo-500 disabled:bg-indigo-1000"
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
        className="rounded-md px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-900 sm:text-sm/6 m-1 hover:bg-indigo-900 disabled:bg-indigo-1000"
      >
        {title}
      </button>
    </div>
  );
}
