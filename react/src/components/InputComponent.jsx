export default function InputComponent({
  required = true,
  pattern = "",
  min = 1,
  max = 50,
  type = "",
  id,
  label,
  colspan = 1,
  placeholder = "", // Added placeholder prop for better UX
}) {
  // Updated classes to match the high-visibility "Search Bar" style
  const classes =
    "block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";
  
  const labelClasses = 
    "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2";

  return (
    <div className={`col-span-${colspan}`}>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="mt-1">
        {type === "number" ? (
          <input
            required={required}
            pattern={pattern}
            type={type}
            id={id}
            name={id}
            min={min}
            max={max}
            placeholder={placeholder}
            className={classes}
          />
        ) : type === "date" ? (
          <input
            required={required}
            pattern={pattern}
            type={type}
            id={id}
            name={id}
            className={classes}
          />
        ) : type === "textarea" ? (
          <textarea
            required={required}
            id={id}
            name={id}
            rows={4} // Added rows for better default textarea height
            minLength={min}
            maxLength={max}
            placeholder={placeholder}
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
            placeholder={placeholder}
            className={classes}
          />
        )}
      </div>
    </div>
  );
}