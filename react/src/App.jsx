import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Account from "./pages/Account.jsx";
import Fines from "./pages/Fines.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import ItemEntry from "./pages/ItemEntry.jsx";
import Books from "./pages/Books.jsx";
import Periodicals from "./pages/Periodicals.jsx";
import AudiovisualMedia from "./pages/AudiovisualMedia.jsx";
import NewCopies from "./pages/NewCopies.jsx";
import Equipment from "./pages/Equipment.jsx";
import Loans from "./pages/Loans.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import Report from "./pages/Report.jsx";
import Search from "./pages/Search.jsx";
import StaffFines from "./pages/StaffFines.jsx";
import StaffRegistration from "./pages/StaffRegistration.jsx";
import TestPage from "./pages/TestPage.jsx";
import StaffLoans from "./pages/StaffLoans.jsx";
import Logout from "./pages/Logout.jsx";
import CreateSignupCode from "./pages/CreateSignupCode.jsx";
import { ReadStoredJson } from "./api";

function App() {
const user = ReadStoredJson("user");
const userType = user?.user_type;
const roleCode = Number(user?.role);

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/account", label: "Account" },

  ...(!user ? [{ to: "/login", label: "Login" }] : []),

  ...(user ? [{ to: "/logout", label: "Logout" }] : []),

  ...(userType === "staff" && roleCode === 2
    ? [{ to: "/createsignupcode", label: "Create Signup Code" }]
    : []),

  ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
    ? [{ to: "/itementry", label: "Item Entry (Staff)" }]
    : []),

  ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
    ? [{ to: "/stafffines", label: "Staff Fines (Staff)" }]
    : []),

  ...(userType === "staff" && roleCode === 2
    ? [{ to: "/report", label: "Report (Admin)" }]
    : []),

  ...(userType === "staff" && roleCode === 2
    ? [{ to: "/staffregistration", label: "Staff Registration (Admin)" }]
    : []),

  { to: "/test", label: "Test Page" },
  
];

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
            <Route path="/account" element={<Account />}>
              <Route path="accountinfo" element={<Navigate to="/account" replace />} />
              <Route path="fines" element={<Fines />} />
              <Route path="loans" element={<Loans />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/stafffines" element={<StaffFines />} />
            <Route path="/itementry" element={<ItemEntry />}>
              <Route path="books" element={<Books />} />
              <Route path="periodicals" element={<Periodicals />} />
              <Route path="audiovisualmedia" element={<AudiovisualMedia />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="newcopies" element={<NewCopies />} />
            </Route>
            <Route path="/staffregistration" element={<StaffRegistration />} />
            <Route path="/report" element={<Report />} />
            <Route path="/search" element={<Search />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/createsignupcode" element={<CreateSignupCode />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
