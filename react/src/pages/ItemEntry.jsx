import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ReadStoredUser } from "../api";

const navLinks = [
  { to: "books", label: "Books" },
  { to: "periodicals", label: "Periodicals" },
  { to: "audiovisualmedia", label: "Audiovisual Media" },
  { to: "equipment", label: "Equipment" },
  { to: "manage", label: "Manage Items" },
];

export default function ItemEntry() {
  const navigate = useNavigate();
  const user = ReadStoredUser();
  const userKey = user ? `${user.user_type ?? ""}:${user.staff_id ?? ""}` : "";

  useEffect(() => {
    const currentUser = ReadStoredUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.user_type !== "staff") {
      navigate("/", { replace: true });
    }
  }, [navigate, userKey]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 lg:sticky lg:top-8 lg:w-72 lg:self-start">
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
      <main className="flex-1 space-y-8 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Item Entry
        </h1>
        <Outlet />
      </main>
    </div>
  );
}
