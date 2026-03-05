import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import FinesPage from "./pages/FinesPage.jsx";
import LoanPage from "./pages/LoanPage.jsx";
import HoldPage from "./pages/HoldPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import TestPage from "./pages/TestPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">
          <button>Home</button>
        </Link>
        <Link to="/TestPage">
          <button>TestPage</button>
        </Link>
        <Link to="/AccountPage">
          <button>AccountPage</button>
        </Link>
        <Link to="/FinesPage">
          <button>FinesPage</button>
        </Link>
        <Link to="/HoldPage">
          <button>HoldPage</button>
        </Link>
        <Link to="/LoanPage">
          <button>LoanPage</button>
        </Link>
        <Link to="/RegistrationPage">
          <button>RegistrationPage</button>
        </Link>
        <Link to="/ReportPage">
          <button>ReportPage</button>
        </Link>
        <Link to="/SearchPage">
          <button>SearchPage</button>
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/TestPage" element={<TestPage />} />
        <Route path="/AccountPage" element={<AccountPage />} />
        <Route path="/FinesPage" element={<FinesPage />} />
        <Route path="/HoldPage" element={<HoldPage />} />
        <Route path="/LoanPage" element={<LoanPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/ReportPage" element={<ReportPage />} />
        <Route path="/SearchPage" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
