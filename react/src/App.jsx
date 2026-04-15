import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";

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
import PopularityReport from "./pages/PopularityReport.jsx";
import PatronSummaryReport from "./pages/PatronSummaryReport.jsx";
import OverdueReport from "./pages/OverdueReport.jsx";
import TestingReport from "./pages/TestingReport.jsx";
import FineSummaryReport from "./pages/FineSummaryReport";
import AccountHolds from "./pages/AccountHolds";
import StaffLoans from "./pages/StaffLoans";
import StaffFines from "./pages/StaffFines";
import Holds from "./pages/Holds";
import Lost from "./pages/Lost";

import { ReadStoredUser } from "./api";
import { MessageProvider } from "./context/MessageContext.jsx";

// Import the new NotificationBell component
import NotificationBell from "./components/NotificationBell.jsx";

function AccountRouter({ patronPage, staffPage }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return null;

  return user.user_type === "patron" ? patronPage : staffPage;
}

function NavSection({ title, links }) {
  if (!links.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
        {title}
      </p>

      <div className="space-y-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-500/20 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-sky-400"></span>
                )}
                {label}
              </>
            )}
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
          { to: "/changerole", label: "User Management" },
          { to: "/report", label: "Reports" },
          { to: "/staffregistration", label: "Staff Signup" },
          { to: "/createsignupcode", label: "New Signup Code" },
        ]
      : [];

  // const miscLinks = [{ to: "/test", label: "Test Page" }];

  return (
    <MessageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <header className=" top-0 border-b border-white/10 bg-slate-950 px-6 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/Datahaven.jpg"
                className="h-10 w-10 rounded-lg"
                alt="logo"
              />
              <div>
                <h1 className="text-xl font-bold tracking-widest">
                  Datahaven Library
                </h1>
              </div>
            </div>

            {!user ? (
              <NavLink
                to="/login"
                className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Login
              </NavLink>
            ) : (
              <div className="flex items-center gap-4">
                
                {/* Notification Bell Component */}
                <NotificationBell />

                <span className="text-slate-300">
                  Hello{" "}
                  <span className="font-semibold text-white">
                    {user.first_name}
                  </span>
                </span>
                <NavLink
                  to="/logout"
                  className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300"
                >
                  Logout
                </NavLink>
              </div>
            )}
          </header>

          <div className="flex">
            <aside className="w-[165px] border-r border-white/10 bg-slate-600/50 p-5 space-y-6">
              <NavSection title="General" links={generalLinks} />
              <NavSection title="Staff" links={staffLinks} />
              <NavSection title="Admin" links={adminLinks} />
              {/* <NavSection title="Misc" links={miscLinks} /> */}
            </aside>

            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />

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
                <Route path="/logout" element={<Logout />} />

                <Route path="/staffloans" element={<StaffLoans />} />
                <Route path="/stafffines" element={<StaffFines />} />
                <Route path="/holds" element={<Holds />} />
                <Route path="/lost" element={<Lost />} />

                <Route path="/itementry" element={<ItemEntry />}>
                  <Route index element={<Navigate to="books" replace />} />
                  <Route path="books" element={<Books />} />
                  <Route path="periodicals" element={<Periodicals />} />
                  <Route
                    path="audiovisualmedia"
                    element={<AudiovisualMedia />}
                  />
                  <Route path="equipment" element={<Equipment />} />
                  <Route path="manage" element={<ItemManager />} />
                </Route>

                <Route path="/changerole" element={<ChangeRole />} />
                <Route
                  path="/createsignupcode"
                  element={<CreateSignupCode />}
                />
                <Route
                  path="/staffregistration"
                  element={<StaffRegistration />}
                />

                <Route path="/report" element={<Report />} />
                <Route
                  path="/report/PopularityReport"
                  element={<PopularityReport />}
                />
                <Route
                  path="/report/patron-summary"
                  element={<PatronSummaryReport />}
                />
                <Route
                  path="/report/overduereport"
                  element={<OverdueReport />}
                />
                <Route
                  path="/report/fine-summary"
                  element={<FineSummaryReport />}
                />
                <Route path="/report/testing" element={<TestingReport />} />

                {/* <Route path="/test" element={<TestPage />} /> */}
                <Route path="/forgotpassword" element={<ForgotPassword />} />
              </Routes>
            </main>
          </div>

          <footer className="border-t border-white/10 text-center py-4 text-sm text-slate-400">
            <div className="grid grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold">Resources</h3>
                <p className="mt-2">Item Requests</p>
                <p className="mt-2">Donate</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">FAQs</h3>
                <p className="mt-2">Library Policies</p>
                <p className="mt-2">Library Collection</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">About Us</h3>
                <p className="mt-2">About Datahaven Library</p>
                <p className="mt-2">Library Hours</p>
              </div>
            </div>
            <div className="mt-2 text-sky-400">
              Version {version} — Datahaven Library Database
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </MessageProvider>
  );
}

export default App;
