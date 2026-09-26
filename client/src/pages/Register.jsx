import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const language =
    localStorage.getItem("udharpay_language") || "en";

  const text = {
    title:
      language === "hi"
        ? "अकाउंट बनाएँ"
        : "Create Account",

    subtitle:
      language === "hi"
        ? "शुरू करने के लिए अपना UdharPay अकाउंट बनाएँ।"
        : "Create your UdharPay account to get started.",

    fullName:
      language === "hi"
        ? "पूरा नाम"
        : "Full Name",

    namePlaceholder:
      language === "hi"
        ? "अपना पूरा नाम दर्ज करें"
        : "Enter your full name",

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
        ? "पासवर्ड बनाएँ"
        : "Create a password",

    confirmPassword:
      language === "hi"
        ? "पासवर्ड की पुष्टि करें"
        : "Confirm Password",

    confirmPlaceholder:
      language === "hi"
        ? "अपना पासवर्ड दोबारा दर्ज करें"
        : "Confirm your password",

    creating:
      language === "hi"
        ? "अकाउंट बनाया जा रहा है..."
        : "Creating account...",

    create:
      language === "hi"
        ? "अकाउंट बनाएँ"
        : "Create Account",

    alreadyAccount:
      language === "hi"
        ? "क्या आपका पहले से अकाउंट है?"
        : "Already have an account?",

    login:
      language === "hi"
        ? "लॉगिन करें"
        : "Login",

    passwordMismatch:
      language === "hi"
        ? "पासवर्ड मेल नहीं खाते।"
        : "Passwords do not match.",

    passwordLength:
      language === "hi"
        ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
        : "Password must be at least 6 characters.",
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage(text.passwordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setMessage(text.passwordLength);
      return;
    }

    setLoading(true);

    const result = await registerUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      navigate("/login");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{text.title}</h1>

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
            <label htmlFor="name">
              {text.fullName}
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder={text.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">
              {text.confirmPassword}
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder={text.confirmPlaceholder}
              value={formData.confirmPassword}
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
              ? text.creating
              : text.create}
          </button>
        </form>

        <p className="auth-switch">
          {text.alreadyAccount}{" "}
          <Link to="/login">
            {text.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;