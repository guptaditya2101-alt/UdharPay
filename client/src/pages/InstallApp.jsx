import { Link } from "react-router-dom";

const InstallApp = () => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <main className="install-page">
      <div className="install-card">
        <div className="install-logo">U</div>

        <h1>Install UdharPay</h1>

        <p>
          Manage customer udhar, payments and balances in one place.
          Get started for free.
        </p>

        <div className="install-option">
          <h2>🤖 Android</h2>
          <p>
            Open this website in Chrome. Open the browser menu and look
            for "Install app" or "Add to Home screen".
          </p>
        </div>

        <div className="install-option">
          <h2>🍎 iPhone</h2>
          <p>
            Open this website in Safari, tap the Share button, select
            "Add to Home Screen", then tap "Add".
          </p>
        </div>

        {isIOS && (
          <p className="install-note">
            For iPhone, use Safari to add UdharPay to your Home Screen.
          </p>
        )}

        <Link to="/register" className="install-primary-btn">
          Create Free Account
        </Link>

        <Link to="/login" className="install-login-link">
          Already have an account? Login
        </Link>

        <Link to="/" className="install-home-link">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
};

export default InstallApp;