import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const navLinks = [
  { to: ".", label: "Item Entry" },
  { to: "books", label: "Books" },
  { to: "periodicals", label: "Periodicals" },
  { to: "audiovisualmedia", label: "Audiovisual Media" },
  { to: "equipment", label: "Equipment" },
];

export default function ItemEntry() {
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
        <h1 className="text-3xl font-bold text-white">Item Entry</h1>
        <Outlet />
      </main>
    </div>
  );
}
