export default function Dropdown({ name, options }) {
  const inputClasses = "block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all";
  const labelClasses = "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2";

  return (
    <div>
      <label htmlFor={name} className={labelClasses}>{name}</label>
      <div className="mt-1">
        <select
          id={name}
          name={name}
          className={inputClasses}
        >
          {options.map((option, index) => (
            <option
              key={index}
              value={option}
              className="text-slate-900"
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DisabledDropdown({ name }) {
  const inputClasses = "block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 shadow-sm outline-none cursor-not-allowed";
  const labelClasses = "block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2";

  return (
    <div>
      <label htmlFor={name} className={labelClasses}>Loading {name}...</label>
      <div className="mt-1">
        <select
          required
          disabled
          id={name}
          name={name}
          className={inputClasses}
        ></select>
      </div>
    </div>
  );
}

export function ObjectDropdown({ name, options }) {
  const inputClasses = "block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all";
  const labelClasses = "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2";

  const keys = Object.keys(options[0]);
  const code = keys[0];
  const term = keys[1];

  return (
    <div>
      <label htmlFor={name} className={labelClasses}>{name}</label>
      <div className="mt-1">
        <select
          required
          id={name}
          name={name}
          className={inputClasses}
        >
          {options.map((option) => {
            return (
              <option
                key={option[code]}
                value={option[code]}
                className="text-slate-900"
              >
                {option[term]}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}