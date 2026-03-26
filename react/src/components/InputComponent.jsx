export default function InputComponent({
  required = true,
  pattern = "",
  min = 1,
  max = 50,
  type = "",
  id,
  label,
  colspan = 1,
}) {
  const classes =
    "block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";
  return (
    <div className={"col-span-" + colspan}>
      <label htmlFor={id}>{label}</label>
      <div className="mt-2">
        {type == "number" ? (
          <input
            required={required}
            pattern={pattern}
            type={type}
            id={id}
            name={id}
            min={min}
            max={max}
            className={classes}
          />
        ) : type == "date" ? (
          <input
            required={required}
            pattern={pattern}
            type={type}
            id={id}
            name={id}
            className={classes}
          />
        ) : type == "textarea" ? (
          <textarea
            required
            pattern={pattern}
            id={id}
            name={id}
            minLength={min}
            maxLength={max}
            className={classes}
          />
        ) : (
          <input
            required={required}
            pattern={pattern}
            type={type}
            id={id}
            name={id}
            minLength={min}
            maxLength={max}
            className={classes}
          />
        )}
      </div>
    </div>
  );
}
