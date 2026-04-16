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
      {/* Sidebar - Updated to match light theme */}
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:w-72 lg:self-start">
        <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Navigation
        </h2>
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Item Entry
          </h1>
          <p className="text-slate-500 mt-1">Add or manage library inventory.</p>
        </div>
        
        {/* The Outlet renders the individual form pages (Books, Equipment, etc.) */}
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}