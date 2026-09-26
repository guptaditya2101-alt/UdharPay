import { Link } from "react-router-dom";
import { t } from "../utils/translations";

const NotFound = () => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  const text = {
    title:
      language === "hi"
        ? "पेज नहीं मिला"
        : "Page Not Found",

    description:
      language === "hi"
        ? "आप जिस पेज को ढूंढ रहे हैं वह मौजूद नहीं है।"
        : "The page you are looking for does not exist.",

    home:
      language === "hi"
        ? "होम पर जाएँ"
        : "Go to Home",
  };

  return (
    <div className="empty-state">
      <h1>404</h1>

      <h2>{text.title}</h2>

      <p>{text.description}</p>

      <Link
        to="/"
        className="submit-btn"
      >
        {text.home}
      </Link>
    </div>
  );
};

export default NotFound;