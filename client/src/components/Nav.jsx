import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../styles/Navbar.css";
import {
  logoutUser,
  isAuthenticated,
} from "../services/authService";
import { t, getLanguage } from "../utils/translations";

const Nav = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(getLanguage());
  const loggedIn = isAuthenticated();

  const changeLanguage = (newLanguage) => {
    localStorage.setItem("udharpay_language", newLanguage);
    setLanguage(newLanguage);
    window.location.reload();
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-logo">U</div>
        <div className="brand-text">
          <h2>UdharPay</h2>
          <span>{t("digitalUdharManager")}</span>
        </div>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/">{t("home")}</NavLink>

        {loggedIn ? (
          <>
            <NavLink to="/dashboard">{t("dashboard")}</NavLink>
            <NavLink to="/customers">{t("customers")}</NavLink>
            <NavLink to="/add-customer">{t("addCustomer")}</NavLink>
            <NavLink to="/business-profile">
              🏪 {t("businessProfile")}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}

        <div className="language-switch">
          <button
            type="button"
            className={language === "hi" ? "language-active" : ""}
            onClick={() => changeLanguage("hi")}
          >
            हिंदी
          </button>
          <button
            type="button"
            className={language === "en" ? "language-active" : ""}
            onClick={() => changeLanguage("en")}
          >
            English
          </button>
        </div>

        {loggedIn && (
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            {t("logout")}
          </button>
        )}
      </nav>
    </header>
  );
};

export default Nav;