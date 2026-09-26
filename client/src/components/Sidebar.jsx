import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import { t } from "../utils/translations";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>UdharPay</h2>
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">📊</span>
          {t("dashboard")}
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">👥</span>
          {t("customers")}
        </NavLink>

        <NavLink
          to="/add-customer"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">➕</span>
          {t("addCustomer")}
        </NavLink>

        <NavLink
          to="/business-profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">🏪</span>
          {t("businessProfile")}
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <p>{t("digitalUdharManager")}</p>
      </div>
    </aside>
  );
};

export default Sidebar;