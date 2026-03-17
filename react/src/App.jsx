import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import Account from "./pages/Account.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import StaffRegistration from "./pages/StaffRegistration.jsx";
import Report from "./pages/Report.jsx";
import TestPage from "./pages/TestPage.jsx";
import Fines from "./pages/Fines.jsx";
import ItemEntry from "./pages/ItemEntry.jsx";
import StaffFines from "./pages/StaffFines.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/login", label: "Login" },
  { to: "/account", label: "Account" },
  { to: "/itementry", label: "Item Entry (Staff)" },
  { to: "/report", label: "Report (Admin)" },
  { to: "/test", label: "Test Page" },
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen min-w-80 bg-slate-950 text-slate-100 antialiased">
        <nav className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4 sm:px-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-full border border-sky-400/20 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-300 hover:bg-slate-800"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/fines" element={<Fines />} />
            <Route path="/stafffines" element={<StaffFines />} />
            <Route path="/itementry" element={<ItemEntry />} />
            <Route path="/staffregistration" element={<StaffRegistration />} />
            <Route path="/report" element={<Report />} />
            <Route path="/search" element={<Search />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
