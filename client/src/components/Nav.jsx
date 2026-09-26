import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../styles/Navbar.css";
import { logoutUser } from "../services/authService";
import { t, getLanguage } from "../utils/translations";

const Nav = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    getLanguage()
  );

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const changeLanguage = (newLanguage) => {
    localStorage.setItem(
      "udharpay_language",
      newLanguage
    );

    setLanguage(newLanguage);

    window.location.reload();
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="brand-logo">U</div>

        <div className="brand-text">
          <h2>UdharPay</h2>
          <span>{t("digitalUdharManager")}</span>
        </div>
      </NavLink>

      <nav className="navbar-links">
        <NavLink to="/">
          {t("home")}
        </NavLink>

        <NavLink to="/dashboard">
          {t("dashboard")}
        </NavLink>

        <NavLink to="/customers">
          {t("customers")}
        </NavLink>

        <NavLink to="/add-customer">
          {t("addCustomer")}
        </NavLink>

        <NavLink to="/business-profile">
          🏪 {t("businessProfile")}
        </NavLink>

        {/* LANGUAGE SWITCH */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px",
            borderRadius: "8px",
            background: "#f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={() =>
              changeLanguage("hi")
            }
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              cursor: "pointer",
              fontWeight: "600",
              background:
                language === "hi"
                  ? "#0f9d58"
                  : "transparent",
              color:
                language === "hi"
                  ? "#ffffff"
                  : "#374151",
            }}
          >
            हिंदी
          </button>

          <button
            type="button"
            onClick={() =>
              changeLanguage("en")
            }
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              cursor: "pointer",
              fontWeight: "600",
              background:
                language === "en"
                  ? "#0f9d58"
                  : "transparent",
              color:
                language === "en"
                  ? "#ffffff"
                  : "#374151",
            }}
          >
            English
          </button>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          {t("logout")}
        </button>
      </nav>
    </header>
  );
};

export default Nav;