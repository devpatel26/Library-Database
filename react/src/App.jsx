import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Account from "./pages/Account.jsx";
import AccountActivity from "./pages/AccountActivity.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import Fines from "./pages/Fines.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import ItemEntry from "./pages/ItemEntry.jsx";
import ItemManager from "./pages/ItemManager.jsx";
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
import StaffRegistration from "./pages/StaffRegistration.jsx";
import TestPage from "./pages/TestPage.jsx";
import Logout from "./pages/Logout.jsx";
import CreateSignupCode from "./pages/CreateSignupCode.jsx";
import { ReadStoredUser } from "./api";
import PopularityReport from "./pages/PopularityReport.jsx";
import PatronSummaryReport from "./pages/PatronSummaryReport.jsx";
import OverdueReport from "./pages/OverdueReport.jsx";
import TestingReport from "./pages/TestingReport.jsx";
import { MessageProvider } from "./context/MessageContext.jsx";
import FineSummaryReport from "./pages/FineSummaryReport";
import AccountHolds from "./pages/AccountHolds";
import StaffLoans from "./pages/StaffLoans";
import StaffFines from "./pages/StaffFines";
import Holds from "./pages/Holds";
import Lost from "./pages/Lost";

function AccountRouter({ patronPage, staffPage }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return null;

  return user.user_type === "patron" ? patronPage : staffPage;
}

function NavSection({ title, links }) {
  if (!links.length) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-3">
      <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.3em] text-sky-300">
        {title}
      </p>

      <div className="space-y-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-500/15 text-white ring-1 ring-sky-400/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function App() {
  const user = ReadStoredUser();
  const userType = user?.user_type;
  const roleCode = Number(user?.role);
  const version = "1.2.0";

  const generalLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Search" },
    ...(user ? [{ to: "/account", label: "Account" }] : []),
  ];

  const staffLinks =
    userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [
          { to: "/itementry", label: "Item Entry" },
          { to: "/staffloans", label: "Loans" },
          { to: "/holds", label: "Holds" },
          { to: "/stafffines", label: "Fines" },
          { to: "/lost", label: "Lost Items" },
        ]
      : [];

  const adminLinks =
    userType === "staff" && roleCode === 2
      ? [
          { to: "/createsignupcode", label: "Create Signup Code" },
          { to: "/changerole", label: "User Management" },
          { to: "/report", label: "Reports" },
          { to: "/staffregistration", label: "Staff Signup" },
        ]
      : [];

  const miscLinks = [{ to: "/test", label: "Test Page" }];

  return (
    <MessageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
              <div className="mx-auto flex h-[73px] max-w-[1600px] items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/Datahaven.jpg"
                    alt="Datahaven Logo"
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <h1 className="text-xl font-bold tracking-[0.25em] text-white uppercase">
                      DATAHAVEN
                    </h1>
                    <p className="text-xs text-slate-400">
                      Library Database System
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {!user ? (
                    <NavLink
                      to="/login"
                      className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 font-medium text-slate-200 transition hover:border-sky-400/30 hover:bg-slate-800 hover:text-white"
                    >
                      Login
                    </NavLink>
                  ) : (
                    <>
                      <span className="text-slate-300">
                        Hello,{" "}
                        <span className="font-semibold text-white">
                          {user.first_name?.slice(0, 12) || "User"}
                        </span>
                      </span>

                      <NavLink
                        to="/logout"
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                      >
                        Logout
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            </header>

            <div className="mx-auto flex w-full max-w-[1600px] flex-1">
              <aside className="hidden w-[280px] min-w-[280px] shrink-0 border-r border-sky-500/10 bg-slate-900/95 shadow-2xl shadow-black/20 md:block">
                <div className="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto px-4 py-6">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/Datahaven.jpg"
                          alt="Datahaven Logo"
                          className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                            Datahaven
                          </p>
                          <p className="text-xs text-slate-400">
                            Navigation Panel
                          </p>
                        </div>
                      </div>
                    </div>

                    <NavSection title="General" links={generalLinks} />
                    <NavSection title="Staff Tools" links={staffLinks} />
                    <NavSection title="Admin Tools" links={adminLinks} />
                    <NavSection title="Misc" links={miscLinks} />
                  </div>
                </div>
              </aside>

              <main className="min-w-0 flex-1 bg-slate-950 px-4 py-6 sm:px-8 sm:py-8">
                <div className="mx-auto max-w-7xl">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/test" element={<TestPage />} />

                    <Route path="/account" element={<Account />}>
                      <Route
                        path="holds"
                        element={
                          <AccountRouter
                            patronPage={<AccountHolds />}
                            staffPage={<Holds />}
                          />
                        }
                      />
                      <Route
                        path="loans"
                        element={
                          <AccountRouter
                            patronPage={<Loans />}
                            staffPage={<StaffLoans />}
                          />
                        }
                      />
                      <Route
                        path="fines"
                        element={
                          <AccountRouter
                            patronPage={<Fines />}
                            staffPage={<StaffFines />}
                          />
                        }
                      />
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
                      <Route path="manage" element={<ItemManager />} />
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
                    <Route path="/lost" element={<Lost />} />

                    <Route path="/report/PopularityReport" element={<PopularityReport />} />
                    <Route path="/report/patron-summary" element={<PatronSummaryReport />} />
                    <Route path="/report/overduereport" element={<OverdueReport />} />
                    <Route path="/report/fine-summary" element={<FineSummaryReport />} />
                    <Route path="/report/testing" element={<TestingReport />} />
                  </Routes>
                </div>
              </main>
            </div>

            <footer className="border-t border-white/10 bg-slate-950/80">
              <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-slate-400 md:flex-row">
                <div>Version {version}</div>
                <div>&copy; Team Project 2026 Spring. All rights reserved.</div>
                <div className="text-center md:text-right">
                  Datahaven Library Database
                </div>
              </div>
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </MessageProvider>
  );
}

export default App;