import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
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

  return user.user_type === "patron"
    ? patronPage
    : staffPage;
}

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
      ? [{ to: "/lost", label: "Lost Items" }]
      : []),

    ...(userType === "staff" && roleCode === 2
      ? [{ to: "/changerole", label: "User Management" }]
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
  const version = "1.2.0";

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
            <div className="group relative z-50 hidden w-12 flex-shrink-0 transition-[width] duration-300 ease-in-out hover:w-64 md:block">
              <nav className="relative h-full w-full border-r border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden">
                
                {/* Hamburger Icon */}
                <div className="flex h-16 w-12 items-center justify-center text-slate-400 group-hover:opacity-0 transition-opacity duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                
                {/* Expanded Links Container */}
                <div className="absolute top-0 left-0 w-64 h-full overflow-y-auto p-6 pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-75">
                  
                  {/* SIDEBAR LOGO HEADER */}
                  <div className="mb-6 flex items-center gap-3 px-1 border-b border-white/10 pb-4">
                    <img 
                      src="/Datahaven.jpg" 
                      alt="Datahaven Logo" 
                      className="h-8 w-auto rounded object-contain"
                    />
                    <span className="text-lg font-bold tracking-widest text-white uppercase">
                      DATAHAVEN
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pb-6">
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
            <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10 overflow-hidden">
              <div className="mx-auto max-w-5xl">
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
                  <Route path="/staff/lost" element={<Lost />} />
                  <Route path="/report/PopularityReport" element={<PopularityReport />} />
                  <Route path="/report/patron-summary" element={<PatronSummaryReport />} />
                  <Route path="/report/overduereport" element={<OverdueReport />} />
                  <Route path="/report/fine-summary" element={<FineSummaryReport />} />
                  <Route path="/report/testing" element={<TestingReport />} />
                  <Route path="/lost" element={<Lost />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto border-t border-white/10 bg-slate-950/95 backdrop-blur z-40 relative">
            <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row items-center justify-between gap-4 px-6 py-6 text-slate-400 text-sm">
              
              {/* Version Section (Left) */}
              <div className="flex-1 text-center md:text-left">
                Version {version}
              </div>

              {/* Copyright Section (Center) */}
              <div className="flex-1 text-center">
                &copy; Team Project 2026 Spring. All rights reserved.
              </div>

              {/* Social Media Icons (Right) */}
              <div className="flex-1 flex items-center justify-center md:justify-end gap-6">
                {/* Facebook */}
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                {/* X (Twitter) */}
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                {/* YouTube */}
                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                </a>
              </div>

            </div>
          </footer>
        </div>
      </BrowserRouter>
    </MessageProvider>
  );
}

export default App;
