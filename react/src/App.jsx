/*import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Account from "./pages/Account.jsx";
import AccountActivity from "./pages/AccountActivity.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import Fines from "./pages/Fines.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import ItemEntry from "./pages/ItemEntry.jsx";
import Books from "./pages/Books.jsx";
import Periodicals from "./pages/Periodicals.jsx";
import AudiovisualMedia from "./pages/AudiovisualMedia.jsx";
import ChangeRole from "./pages/ChangeRole.jsx";
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
import { ReadStoredUser } from "./api";
import Holds from "./pages/Holds.jsx";
import MostBorrowedBooksReport from "./pages/MostBorrowedBooksReport.jsx";
import PatronSummaryReport from "./pages/PatronSummaryReport.jsx";
import OverdueReport from "./pages/OverdueReport.jsx";
import TestingReport from "./pages/TestingReport.jsx";
import { MessageProvider } from "./context/MessageContext.jsx";
import FineSummaryReport from "./pages/FineSummaryReport";

function App() {
  const user = ReadStoredUser();
  const userType = user?.user_type;
  const roleCode = Number(user?.role);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Search" },

    ...(!user
      ? [{ to: "/login", label: "Login" }]
      : [
          { to: "/account", label: "Account" },
          { to: "/logout", label: "Logout" },
        ]),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/createsignupcode", label: "Create Signup Code" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/itementry", label: "Item Entry" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/staffloans", label: "Loans" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/holds", label: "Holds" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/stafffines", label: "Fines" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/changerole", label: "Patron Roles" }]
      : []),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/report", label: "Reports" }]
      : []),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/staffregistration", label: "Staff Signup" }]
      : []),

    { to: "/test", label: "Test Page" },
  ];
  const version = "1.1.0";

  return (
    <MessageProvider>
    <BrowserRouter>
      <div className="min-h-screen min-w-80 bg-slate-950 text-slate-100 antialiased flex flex-col">
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

        <main className="w-full flex-1 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/account" element={<Account />}>
              <Route
                path="accountinfo"
                element={<Navigate to="/account" replace />}
              />
              <Route path="loans" element={<Loans />} />
              <Route path="fines" element={<Fines />} />
              <Route path="activity" element={<AccountActivity />} />
              <Route path="settings" element={<AccountSettings />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/stafffines" element={<StaffFines />} />
            <Route path="/itementry" element={<ItemEntry />}>
              <Route path="books" element={<Books />} />
              <Route path="periodicals" element={<Periodicals />} />
              <Route path="audiovisualmedia" element={<AudiovisualMedia />} />
              <Route path="equipment" element={<Equipment />} />
            </Route>
            <Route path="/changerole" element={<ChangeRole />} />
            <Route path="/staffregistration" element={<StaffRegistration />} />
            <Route path="/report" element={<Report />} />
            <Route path="/search" element={<Search />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/createsignupcode" element={<CreateSignupCode />} />
            <Route path="/holds" element={<Holds />} />
            <Route path="/staffloans" element={<StaffLoans />} />

            <Route
              path="/report/mostborrowedbooks"
              element={<MostBorrowedBooksReport />}
            />
            <Route
              path="/report/patronsummary"
              element={<PatronSummaryReport />}
            />
            <Route path="/report/overduereport" element={<OverdueReport />} />
            <Route path="/report/testing" element={<TestingReport />} />
            <Route path="/report/fine-summary" element={<FineSummaryReport />} />
          
          </Routes>
        </main>
        <footer className="bottom-0 border-t border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4 sm:px-6 text-centered">
            Version {version}
          </div>
        </footer>
      </div>
      
    </BrowserRouter>
    </MessageProvider>
  );
}

export default App;

*/


import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Account from "./pages/Account.jsx";
import AccountActivity from "./pages/AccountActivity.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import Fines from "./pages/Fines.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import ItemEntry from "./pages/ItemEntry.jsx";
import Books from "./pages/Books.jsx";
import Periodicals from "./pages/Periodicals.jsx";
import AudiovisualMedia from "./pages/AudiovisualMedia.jsx";
import ChangeRole from "./pages/ChangeRole.jsx";
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
import { ReadStoredUser } from "./api";
import Holds from "./pages/Holds.jsx";
import MostBorrowedBooksReport from "./pages/MostBorrowedBooksReport.jsx";
import PatronSummaryReport from "./pages/PatronSummaryReport.jsx";
import OverdueReport from "./pages/OverdueReport.jsx";
import TestingReport from "./pages/TestingReport.jsx";
import { MessageProvider } from "./context/MessageContext.jsx";
import FineSummaryReport from "./pages/FineSummaryReport";

function App() {
  const user = ReadStoredUser();
  const userType = user?.user_type;
  const roleCode = Number(user?.role);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Search" },

    ...(!user
      ? [{ to: "/login", label: "Login" }]
      : [{ to: "/account", label: "Account" }]),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/createsignupcode", label: "Create Signup Code" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/itementry", label: "Item Entry" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/staffloans", label: "Loans" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/holds", label: "Holds" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/stafffines", label: "Fines" }]
      : []),

    ...(userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [{ to: "/changerole", label: "Patron Roles" }]
      : []),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/report", label: "Reports" }]
      : []),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/staffregistration", label: "Staff Signup" }]
      : []),

    { to: "/test", label: "Test Page" },

    // Logout moved to the bottom, only showing if a user is logged in
    ...(user ? [{ to: "/logout", label: "Logout" }] : []),
  ];
  const version = "1.1.0";

  return (
    <MessageProvider>
      <BrowserRouter>
        <div className="min-h-screen min-w-80 bg-slate-950 text-slate-100 antialiased flex flex-col">
          
          {/* HEADER SECTION */}
          <header className="border-b border-white/10 bg-slate-950/95 py-5 px-6 backdrop-blur z-40 relative">
            <div className="mx-auto flex max-w-[1400px] items-center justify-center gap-4">
              {/* Datahaven Logo */}
              <img 
                src="/Datahaven.jpg" 
                alt="Datahaven Logo" 
                className="h-10 w-auto rounded object-contain"
              />
              <h1 className="text-2xl font-bold tracking-widest text-white uppercase">
                DATAHAVEN
              </h1>
            </div>
          </header>

          {/* MAIN LAYOUT WRAPPER */}
          <div className="flex flex-1 mx-auto max-w-[1400px] w-full relative">
            
            {/* HOVER-EXPANDING LEFT SIDEBAR */}
            <div className="relative z-50 hidden md:block w-12 flex-shrink-0">
              <nav className="absolute top-0 left-0 h-full w-12 hover:w-64 transition-all duration-300 ease-in-out border-r border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden group">
                
                {/* Hamburger Icon */}
                <div className="flex h-16 w-12 items-center justify-center text-slate-400 group-hover:opacity-0 transition-opacity duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                
                {/* Expanded Links Container */}
                <div className="absolute top-0 left-0 w-64 p-6 pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-75">
                  <div className="mb-4 flex items-center justify-between px-1 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Navigation Menu</span>
                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    {navLinks.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="rounded-lg border border-transparent bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-sky-400/30 hover:bg-slate-800 hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

              </nav>
            </div>

            {/* MAIN ROUTE CONTENT */}
            <main className="w-full flex-1 px-4 py-8 sm:px-8 sm:py-10 overflow-hidden">
              <div className="mx-auto max-w-5xl">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/account" element={<Account />}>
                    <Route
                      path="accountinfo"
                      element={<Navigate to="/account" replace />}
                    />
                    <Route path="loans" element={<Loans />} />
                    <Route path="fines" element={<Fines />} />
                    <Route path="activity" element={<AccountActivity />} />
                    <Route path="settings" element={<AccountSettings />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/registration" element={<Registration />} />
                  <Route path="/stafffines" element={<StaffFines />} />
                  <Route path="/itementry" element={<ItemEntry />}>
                    <Route path="books" element={<Books />} />
                    <Route path="periodicals" element={<Periodicals />} />
                    <Route path="audiovisualmedia" element={<AudiovisualMedia />} />
                    <Route path="equipment" element={<Equipment />} />
                  </Route>
                  <Route path="/changerole" element={<ChangeRole />} />
                  <Route path="/staffregistration" element={<StaffRegistration />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/createsignupcode" element={<CreateSignupCode />} />
                  <Route path="/holds" element={<Holds />} />
                  <Route path="/staffloans" element={<StaffLoans />} />
                  <Route
                    path="/report/mostborrowedbooks"
                    element={<MostBorrowedBooksReport />}
                  />
                  <Route
                    path="/report/patronsummary"
                    element={<PatronSummaryReport />}
                  />
                  <Route path="/report/overduereport" element={<OverdueReport />} />
                  <Route path="/report/fine-summary" element={<FineSummaryReport />} />
                  <Route path="/report/testing" element={<TestingReport />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto border-t border-white/10 bg-slate-950/95 backdrop-blur z-40 relative">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4 sm:px-6 text-center text-slate-400 text-sm">
              Version {version}
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </MessageProvider>
  );
}

export default App;