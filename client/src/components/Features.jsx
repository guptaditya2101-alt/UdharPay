import "../styles/Features.css";
import { t } from "../utils/translations";

const Features = () => {
  const features = [
    {
      icon: "👥",
      title: t("customerManagement"),
      description: t("customerManagementDescription"),
    },
    {
      icon: "💰",
      title: t("paymentTracking"),
      description: t("paymentTrackingDescription"),
    },
    {
      icon: "📊",
      title: t("udharReports"),
      description: t("udharReportsDescription"),
    },
  ];

  return (
    <section className="features-section">
      <div className="features-header">
        <span className="section-badge">
          {t("features")}
        </span>

        <h2>
          {t("everythingYouNeed")}
        </h2>

        <p>
          {t("simpleTools")}
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <div
            className="feature-card"
            key={feature.title}
          >
            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;