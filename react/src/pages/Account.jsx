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
      <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 lg:sticky lg:top-8 lg:w-72 lg:self-start">
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-sky-400/10 text-white"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-bold text-white">Account</h1>
        {outlet ? (
          outlet
        ) : (
          <section className="space-y-4 text-slate-200">
            <p className="text-slate-300">
              View your account details below.
              {isPatron
                ? " Use the account menu for fines, activity, loan history, and settings."
                : ""}
              {isStaff
                ? " Warning: This is a staff account. Do not share your credentials."
                : ""}
            </p>

            {loading && <p className="text-slate-300">Loading account...</p>}

            {!loading && error && <p className="text-rose-300">{error}</p>}

            {!loading && !error && account && (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold text-white">
                    Account Type:
                  </span>{" "}
                  {account.user_type === "staff" ? "Staff" : "Patron"}
                </p>
                <p>
                  <span className="font-semibold text-white">Name:</span>{" "}
                  {account.first_name} {account.last_name}
                </p>
                <p>
                  <span className="font-semibold text-white">Email:</span>{" "}
                  {account.email}
                </p>
                <p>
                  <span className="font-semibold text-white">
                    {account.user_type === "staff" ? "Staff ID:" : "Member ID:"}
                  </span>{" "}
                  {account.staff_id ?? account.patron_id}
                </p>
                <p>
                  <span className="font-semibold text-white">Role Code:</span>{" "}
                  {account.role}
                </p>
                <p>
                  <span className="font-semibold text-white">Status:</span>{" "}
                  {account.is_active ? "Active" : "Inactive"}
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Date of Birth:
                  </span>{" "}
                  {FormatDateOfBirth(account.date_of_birth)}
                </p>
                {account.phone_number && (
                  <p>
                    <span className="font-semibold text-white">Phone:</span>{" "}
                    {account.phone_number}
                  </p>
                )}
                {account.address && (
                  <p>
                    <span className="font-semibold text-white">Address:</span>{" "}
                    {account.address}
                  </p>
                )}
              </div>
            )}

            {!loading && !error && !account && (
              <p className="text-slate-300">No account found.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
