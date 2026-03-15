import { Routes, Route, Link } from "react-router-dom";

import Fines from "./Fines";
import StaffFines from "./StaffFines";
import Loans from "./Loans";
import StaffLoans from "./StaffLoans";

const navLinks = [
  { to: "/account", label: "Account"},
  { to: "/fines", label: "Fines"},
  { to: "/loans", label: "Loans"}
];

export default function Account() {
  return (
    <div className="flex">
      <nav className="w-64 h-screen sticky top-0 p-4 border-r">
        <div className="flex flex-col gap-4 p-2 items-start">
          {navLinks.map((link, index) => (
            <Link
              key={index} 
              to={link.to}
              className="block w-full rounded px-3 py-2 text-left hover:bg-slate-700 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="flex-1 p-8 space-y-24">
        <h1 className="text-3xl font-bold">
          Account
        </h1>
        <Routes>
          <Route path="/fines" element={<Fines />} />
          <Route path="/stafffines" element={<StaffFines />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/staffloans" element={<StaffLoans />} />
        </Routes>
      </main>
    </div>
  );
}
