import { Link } from "react-router-dom";
import "../styles/Hero.css";
import { t } from "../utils/translations";
import { isAuthenticated } from "../services/authService";

const Hero = () => {
  const loggedIn = isAuthenticated();

  const handleInstall = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      alert(
        'iPhone par UdharPay install karne ke liye Safari mein website kholo, Share button dabao aur "Add to Home Screen" chuno.'
      );
      return;
    }

    alert(
      'Browser ke menu (⋮) mein "Install app" ya "Add to Home screen" option dekho.'
    );
  };

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
          {loggedIn ? (
            <Link to="/dashboard" className="hero-primary-btn">
              Open Dashboard
            </Link>
          ) : (
            <Link to="/register" className="hero-primary-btn">
              Start Free
            </Link>
          )}

          <Link to="/install" className="hero-secondary-btn">
  Install App
</Link>

          {!loggedIn && (
            <Link to="/login" className="hero-login-btn">
              Login
            </Link>
          )}
        </div>

        <div className="hero-free-note">
          Free to get started · Simple digital udhar management
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