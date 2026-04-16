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
      {/* Sidebar Navigation - Matches Light Theme */}
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:w-72 lg:self-start">
        <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          User Menu
        </h2>
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-50 text-sky-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {/* Main Content Card */}
      <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Account</h1>
        {outlet ? (
          outlet
        ) : (
          <section className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-sm text-slate-600">
                {isPatron
                  ? "View your membership details below. Use the menu to manage loans and settings."
                  : isStaff
                  ? "Logged in as Staff. Exercise caution when viewing internal identifiers."
                  : "Account details are displayed below."}
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-slate-500 font-medium animate-pulse">
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
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</span>
                    <span className="text-lg font-semibold text-slate-900">{account.first_name} {account.last_name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                    <span className="text-lg font-semibold text-slate-900">{account.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {account.user_type === "staff" ? "Staff ID" : "Member ID"}
                    </span>
                    <span className="text-lg font-semibold text-sky-700 font-mono">
                      #{account.staff_id ?? account.patron_id}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</span>
                    <span className="text-lg font-semibold text-slate-900">{FormatDateOfBirth(account.date_of_birth)}</span>
                  </div>
                  {account.phone_number && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</span>
                      <span className="text-lg font-semibold text-slate-900">{account.phone_number}</span>
                    </div>
                  )}
                  {account.address && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Address</span>
                      <span className="text-lg font-semibold text-slate-900 leading-tight">{account.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && !account && (
              <p className="text-slate-400 italic">No account records found in the database.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}