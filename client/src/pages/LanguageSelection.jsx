import { useNavigate } from "react-router-dom";

const LanguageSelection = () => {
  const navigate = useNavigate();

  const selectLanguage = (language) => {
    localStorage.setItem(
      "udharpay_language",
      language
    );

    navigate("/", { replace: true });

    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7faf9",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "35px 25px",
          textAlign: "center",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 18px",
            borderRadius: "18px",
            background: "#0f9d58",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          U
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "30px",
          }}
        >
          Welcome to UdharPay
        </h1>

        <p
          style={{
            margin: "0 0 8px",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          अपनी भाषा चुनें
        </p>

        <p
          style={{
            margin: "0 0 30px",
            color: "#666",
          }}
        >
          Choose your preferred language
        </p>

        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <button
            type="button"
            onClick={() => selectLanguage("hi")}
            style={{
              padding: "16px",
              border:
                "2px solid #0f9d58",
              borderRadius: "12px",
              background: "#0f9d58",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🇮🇳 हिंदी
          </button>

          <button
            type="button"
            onClick={() => selectLanguage("en")}
            style={{
              padding: "16px",
              border:
                "2px solid #0f9d58",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#0f9d58",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🇬🇧 English
          </button>
        </div>

        <p
          style={{
            marginTop: "25px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#888",
          }}
        >
          बाद में भाषा बदली जा सकती है।
        </p>
      </div>
    </div>
  );
};

export default LanguageSelection;