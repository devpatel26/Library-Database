import { Link, useOutlet } from "react-router-dom";
import { useEffect, useState } from "react";

const navLinks = [
  { to: ".", label: "Account" },
  { to: "fines", label: "Fines" },
  { to: "loans", label: "Loans" },
];

function FormatDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) {
    return "Not provided";
  }

  const parsedDate = new Date(dateOfBirth);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateOfBirth;
  }

  return parsedDate.toLocaleDateString("en-US");
}

export default function Account() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const outlet = useOutlet();

  useEffect(() => {
    let isMounted = true;

    async function LoadAccount() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/account");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load account.");
        }

        if (isMounted) {
          setAccount(data);
        }
      } catch (err) {
        if (isMounted) {
          setAccount(null);
          setError(err.message);
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
  }, []);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 lg:sticky lg:top-8 lg:w-72 lg:self-start">
        <nav className="space-y-2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 space-y-8 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-bold text-white">Account</h1>
        {outlet ? (
          outlet
        ) : (
          <section className="space-y-4 text-slate-200">
            <p className="text-slate-300">
              View your profile details below.
            </p>

            {loading && <p className="text-slate-300">Loading account...</p>}

            {!loading && error && (
              <p className="text-rose-300">{error}</p>
            )}

            {!loading && !error && account && (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold text-white">Name:</span>{" "}
                  {account.first_name} {account.last_name}
                </p>
                <p>
                  <span className="font-semibold text-white">Email:</span>{" "}
                  {account.email}
                </p>
                <p>
                  <span className="font-semibold text-white">Member ID:</span>{" "}
                  {account.patron_id}
                </p>
                <p>
                  <span className="font-semibold text-white">Status:</span>{" "}
                  {account.is_active ? "Active" : "Inactive"}
                </p>
                <p>
                  <span className="font-semibold text-white">Date of Birth:</span>{" "}
                  {FormatDateOfBirth(account.date_of_birth)}
                </p>
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
