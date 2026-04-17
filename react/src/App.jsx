import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

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
import AboutUs from "./pages/AboutUs.jsx";
import LibraryHours from "./pages/LibraryHours.jsx";
import LibraryPolicies from "./pages/LibraryPolicies.jsx";

import { ReadStoredUser } from "./api";
import { MessageProvider } from "./context/MessageContext.jsx";
import NotificationBell from "./components/NotificationBell.jsx";

function AccountRouter({ patronPage, staffPage }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return null;

  return user.user_type === "patron" ? patronPage : staffPage;
}

function NavSection({ title, links }) {
  if (!links.length) return null;

  return (
    <div className="font-bold transition-all">
      {/* <p className="mb-2 px-6 text-md font-bold tracking-[0.15em] text-white transition-all">
        {title}
      </p> */}

      <div className="space-y-1 font-bold text-white transition-all whitespace-pre-line">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block w-full px-6 py-2.5 text-sm transition-colors transition-all ${
                isActive
                  ? "bg-cyan-600 "
                  : "text-white/80 hover:bg-cyan-600/50 "
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

  // State to manage sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const generalLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Search" },
    ...(user ? [{ to: "/account", label: "Account" }] : []),
  ];

  const staffLinks =
    userType === "staff" && (roleCode === 1 || roleCode === 2)
      ? [
          // { to: "/itementry", label: "Item Entry" },
          { to: "/itementry/manage", label: "Item\nManagement" },
          { to: "/staffloans", label: "Loans" },
          { to: "/holds", label: "Holds" },
          { to: "/stafffines", label: "Fines" },
          { to: "/lost", label: "Lost\nItems" },
        ]
      : [];

  const adminLinks =
    userType === "staff" && roleCode === 2
      ? [
          { to: "/changerole", label: "Manage\nUsers" },
          { to: "/report", label: "Reports" },
          { to: "/staffregistration", label: "Staff\nSignup" },
          { to: "/createsignupcode", label: "New\nSignup\nCode" },
        ]
      : [];

  return (
    <MessageProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans">
          {/* Header */}
          <header className="top-0 bg-[#164e63] px-6 py-1 flex justify-between items-center text-white z-10 shadow-sm">
            <div className="flex items-center gap-3 s">
              {/* Hamburger Menu Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 mr-1 rounded-lg text-cyan-100 hover:text-white hover:bg-cyan-800 transition-colors focus:outline-none"
                aria-label="Toggle Sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <NavLink to="/" className="hover:text-white transition-colors">
                <img
                  src="/Datahaven.jpg"
                  className="h-9 w-9 rounded-lg bg-white p-0.5"
                  alt="logo"
                />
              </NavLink>
              <NavLink to="/" className="hover:text-white transition-colors">
                <div>
                  <h1 className="text-xl font-bold tracking-wide hidden sm:block">
                    Datahaven Library
                  </h1>
                </div>
              </NavLink>
            </div>

            {!user ? (
              <NavLink
                to="/login"
                className="px-5 py-2 bg-[#0e7490] text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors shadow-sm"
              >
                Login
              </NavLink>
            ) : (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <span className="text-cyan-100 hidden sm:inline">
                  Hello{" "}
                  <span className="font-semibold text-white">
                    {user.first_name || "User"}
                  </span>
                </span>
                <NavLink
                  to="/logout"
                  className="px-4 py-1.5 rounded-md border border-cyan-500 hover:bg-cyan-800 text-white font-medium transition-colors"
                >
                  Logout
                </NavLink>
              </div>
            )}
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Collapsible Sidebar */}
            <aside
              className={`bg-cyan-700 transition-all duration-300 ease-in-out flex-shrink-0 z-0  ${
                isSidebarOpen
                  ? "w-[125px] opacity-100"
                  : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              <div
                className={`transition-opacity duration-300${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
              >
                <NavSection title="General" links={generalLinks} />
                <NavSection title="Staff" links={staffLinks} />
                <NavSection title="Admin" links={adminLinks} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto bg-[#cffafe]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/hours" element={<LibraryHours />} />
                <Route path="/policies" element={<LibraryPolicies />} />

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

                <Route path="/forgotpassword" element={<ForgotPassword />} />
              </Routes>
            </main>
          </div>

          {/* Footer */}
          <footer className="bg-[#164e63] text-cyan-100 pt-2 pb-4 text-sm">
            <div className="w-full mx-auto px-6 w-full">
              <div className="flex flex-wrap gap-8 mb-2 text-center justify-evenly wrap">
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">FAQs</h3>
                  <ul className="space-y-1">
                    <li>
                      <NavLink
                        to="/policies"
                        className="hover:text-white transition-colors"
                      >
                        Policies
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Collection
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">
                    About Us
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <NavLink
                        to="/about"
                        className="hover:text-white transition-colors"
                      >
                        About Datahaven
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/hours"
                        className="hover:text-white transition-colors"
                      >
                        Hours
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-4 border-t border-cyan-800">
                <p className="font-medium tracking-wide">
                  Version {version} — Datahaven Library Database
                </p>

                <div className="flex space-x-6">
                  {/* Social Icons (Instagram, Facebook, X, YouTube) */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </MessageProvider>
  );
}

export default App;
