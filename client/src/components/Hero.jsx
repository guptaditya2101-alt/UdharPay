import { Link } from "react-router-dom";
import "../styles/Hero.css";
import { t } from "../utils/translations";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          {t("smartDigitalUdharManagement")}
        </div>

        <h1>
          {t("manageYourUdhar")}
        </h1>

        <p>
          {t("keepTrack")}
        </p>

        <div className="hero-actions">
          <Link
            to="/dashboard"
            className="hero-primary-btn"
          >
            {t("getStarted")}
          </Link>

          <Link
            to="/add-customer"
            className="hero-secondary-btn"
          >
            {t("addCustomer")}
          </Link>
        </div>
      </div>

      <div className="hero-stats">
        <div className="hero-stat-card">
          <span>👥</span>

          <div>
            <strong>{t("customers")}</strong>
            <p>{t("manageAllRecords")}</p>
          </div>
        </div>

        <div className="hero-stat-card">
          <span>💰</span>

          <div>
            <strong>{t("payments")}</strong>
            <p>{t("trackEveryPayment")}</p>
          </div>
        </div>

        <div className="hero-stat-card">
          <span>📊</span>

          <div>
            <strong>{t("reports")}</strong>
            <p>{t("knowYourBalance")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;