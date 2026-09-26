import { Link } from "react-router-dom";
import "../styles/Footer.css";
import { t } from "../utils/translations";

const Footer = () => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  const text = {
    description:
      language === "hi"
        ? "अपने ग्राहकों, उधार और भुगतान को संभालने का आसान और सुरक्षित तरीका।"
        : "A simple and secure way to manage your customers, udhar, and payments.",

    quickLinks:
      language === "hi"
        ? "त्वरित लिंक"
        : "Quick Links",

    customerManagement:
      language === "hi"
        ? "ग्राहक प्रबंधन"
        : "Customer Management",

    paymentTracking:
      language === "hi"
        ? "भुगतान रिकॉर्ड"
        : "Payment Tracking",

    udharReports:
      language === "hi"
        ? "उधार रिपोर्ट"
        : "Udhar Reports",

    allRightsReserved:
      language === "hi"
        ? "सर्वाधिकार सुरक्षित।"
        : "All rights reserved.",
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>UdharPay</h2>

          <p>{text.description}</p>
        </div>

        <div className="footer-links">
          <h3>{text.quickLinks}</h3>

          <Link to="/">{t("home")}</Link>

          <Link to="/dashboard">
            {t("dashboard")}
          </Link>

          <Link to="/customers">
            {t("customers")}
          </Link>

          <Link to="/add-customer">
            {t("addCustomer")}
          </Link>
        </div>

        <div className="footer-info">
          <h3>UdharPay</h3>

          <p>{text.customerManagement}</p>
          <p>{text.paymentTracking}</p>
          <p>{text.udharReports}</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} UdharPay.{" "}
          {text.allRightsReserved}
        </p>
      </div>
    </footer>
  );
};

export default Footer;