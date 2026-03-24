export default function Dropdown({ name, options }) {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <div className="mt-2">
        <select
          id={name}
          name={name}
          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        >
          {options.map((option, index) => (
            <option
              key={index}
              value={option}
              style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
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
  return (
    <div>
      <label htmlFor={name}>Loading {name}...</label>
      <div className="mt-2">
        <select
          required
          disabled
          id={name}
          name={name}
          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        ></select>
      </div>
    </div>
  );
}
export function ObjectDropdown({ name, options }) {
  const keys = Object.keys(options[0]);
  const code = keys[0];
  const term = keys[1];
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <div className="mt-2">
        <select
          required
          id={name}
          name={name}
          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        >
          {options.map((option) => {
            return (
              <option
                key={option[code]}
                value={option[code]}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
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
