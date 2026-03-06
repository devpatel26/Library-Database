import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import Account from "./pages/Account.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import Report from "./pages/Report.jsx";
import TestPage from "./pages/TestPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">
          <button>Home</button>
        </Link>
        <Link to="/test">
          <button>TestPage</button>
        </Link>
        <Link to="/account">
          <button>Account</button>
        </Link>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/registration">
          <button>Registration</button>
        </Link>
        <Link to="/report">
          <button>Report</button>
        </Link>
        <Link to="/search">
          <button>Search</button>
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/report" element={<Report />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
