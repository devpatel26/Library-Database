import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ReadStoredUser } from "../api";

const navLinks = [
  { to: "manage", label: "Manage Items" },
  { to: "books", label: "Books" },
  { to: "periodicals", label: "Periodicals" },
  { to: "audiovisualmedia", label: "Audiovisual Media" },
  { to: "equipment", label: "Equipment" },
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
      {/* Main Content Area */}
      <main className="flex-1 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:w-72 lg:self-start h-full">
        <div className="mb-2 flex justify-evenly items-center flex-wrap gap-4">
          <h1 className="flex-1 text-4xl font-bold tracking-tight text-slate-900">
            Item Management
          </h1>
          <nav className="flex-3 space-y-1 flex justify-evenly pt-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-md transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-700 shadow-sm font-bold"
                      : "text-slate-600 hover:bg-sky-100/50 font-medium hover:text-sky-600"
                  }`
                }
              >
                {link.label == "Manage Items"
                  ? link.label
                  : link.label.at(-1) == "s"
                    ? link.label.slice(0, link.label.length - 1) + ` Entry`
                    : link.label + ` Entry`}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* The Outlet renders the individual form pages (Books, Equipment, etc.) */}
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
