import { NavLink, useOutlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";

function FormatDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) {
    return "Not provided";
  }

  const dateOnlyMatch =
    typeof dateOfBirth === "string"
      ? dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})/)
      : null;

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const parsedDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );

    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
      parsedDate,
    );
  }

  const parsedDate = new Date(dateOfBirth);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateOfBirth;
  }

  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
    parsedDate,
  );
}

export default function Account() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const outlet = useOutlet();
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";
  const isPatron = user?.user_type === "patron";
  const isStaff = user?.user_type === "staff";

  const navLinks = isPatron
    ? [
        { to: ".", label: "Account", end: true },
        { to: "loans", label: "Loans/Holds" },
        { to: "fines", label: "Fines" },
        { to: "activity", label: "Activity" },
        { to: "settings", label: "Settings" },
      ]
    : isStaff
      ? [
          { to: ".", label: "Account", end: true },
          { to: "settings", label: "Settings" },
        ]
      : [];

  useEffect(() => {
    let isMounted = true;
    const currentUser = ReadStoredUser();

    async function LoadAccount() {
      if (!currentUser) {
        setAccount(null);
        setError("Please log in to access your account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await FetchJson("/api/account");

        if (isMounted) {
          setAccount(data);
        }
      } catch (err) {
        if (isMounted) {
          setAccount(null);
          setError(
            GetErrorMessage(err, "Failed to load account. Please try again."),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    LoadAccount();

    return () => {
      isMounted = false;
    };
  }, [userKey]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-2 flex justify-evenly items-center flex-wrap gap-4">
          <h1 className="flex-1 text-4xl font-bold tracking-tight text-slate-800">
            Account
          </h1>
          <nav className="flex-3 space-y-1 flex justify-evenly pt-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-md transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-700 shadow-sm font-bold"
                      : "text-slate-600 hover:bg-sky-100/50 font-medium hover:text-sky-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {outlet ? (
          outlet
        ) : (
          <section className="space-y-4 pt-2 rounded-xl bg-slate-100/40  border border-gray-100 p-4 inset-shadow-sm ">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
              Information
            </h2>
            <div className="rounded-2xl bg-slate-200/40 p-4 border border-slate-300">
              <p className="text-sm text-slate-600">
                {isPatron
                  ? "View your membership details below. Use the menu to manage loans and settings."
                  : isStaff
                    ? "Logged in as staff."
                    : "Account details are displayed below."}
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-slate-700 font-medium animate-pulse">
                <div className="h-4 w-4 rounded-full bg-sky-400"></div>
                Loading account information...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-medium">
                {error}
              </div>
            )}

            {!loading && !error && account && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                      Full Name
                    </span>
                    <span className="text-lg font-semibold text-sky-800">
                      {account.first_name} {account.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                      Email Address
                    </span>
                    <span className="text-lg font-semibold text-sky-800">
                      {account.email}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                      {account.user_type === "staff" ? "Staff ID" : "Member ID"}
                    </span>
                    <span className="text-lg font-semibold text-sky-800 font-mono">
                      #{account.staff_id ?? account.patron_id}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                      Date of Birth
                    </span>
                    <span className="text-lg font-semibold text-sky-800">
                      {FormatDateOfBirth(account.date_of_birth)}
                    </span>
                  </div>
                  {account.phone_number && (
                    <div>
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                        Phone Number
                      </span>
                      <span className="text-lg font-semibold text-sky-800">
                        {account.phone_number}
                      </span>
                    </div>
                  )}
                  {account.address && (
                    <div>
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                        Primary Address
                      </span>
                      <span className="text-lg font-semibold text-sky-800 leading-tight">
                        {account.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && !account && (
              <p className="text-slate-700 italic">
                No account records found in the database.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
