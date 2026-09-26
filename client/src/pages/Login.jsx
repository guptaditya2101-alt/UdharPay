import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../styles/Auth.css";
import { t } from "../utils/translations";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const language =
    localStorage.getItem("udharpay_language") || "en";

  const text = {
    welcome:
      language === "hi"
        ? "वापस स्वागत है"
        : "Welcome Back",

    subtitle:
      language === "hi"
        ? "अपने ग्राहकों और भुगतानों को संभालने के लिए लॉगिन करें।"
        : "Login to manage your customers and payments.",

    email:
      language === "hi"
        ? "ईमेल पता"
        : "Email Address",

    emailPlaceholder:
      language === "hi"
        ? "अपना ईमेल दर्ज करें"
        : "Enter your email",

    password:
      language === "hi"
        ? "पासवर्ड"
        : "Password",

    passwordPlaceholder:
      language === "hi"
        ? "अपना पासवर्ड दर्ज करें"
        : "Enter your password",

    loggingIn:
      language === "hi"
        ? "लॉगिन हो रहा है..."
        : "Logging in...",

    login:
      language === "hi"
        ? "लॉगिन"
        : "Login",

    noAccount:
      language === "hi"
        ? "क्या आपका अकाउंट नहीं है?"
        : "Don't have an account?",

    register:
      language === "hi"
        ? "रजिस्टर करें"
        : "Register",
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await loginUser(
      formData.email.trim(),
      formData.password
    );

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{text.welcome}</h1>

          <p>{text.subtitle}</p>
        </div>

        {message && (
          <div className="auth-error">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="email">
              {text.email}
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder={text.emailPlaceholder}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {text.password}
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder={text.passwordPlaceholder}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? text.loggingIn
              : text.login}
          </button>
        </form>

        <p className="auth-switch">
          {text.noAccount}{" "}
          <Link to="/register">
            {text.register}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;