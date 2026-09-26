import { useEffect, useState } from "react";
import { getAuthHeaders } from "../services/authService";
import { t } from "../utils/translations";

const API_URL = "http://192.168.1.38:5000/api";

const getMessage = (english, hindi) => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  return language === "hi" ? hindi : english;
};

const BusinessProfile = () => {
  const [form, setForm] = useState({
    businessName: "",
    businessMobile: "",
    businessAddress: "",
    upiId: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/profile`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            getMessage(
              "Unable to load business profile.",
              "व्यापार प्रोफ़ाइल लोड नहीं हो सकी।"
            )
        );
        return;
      }

      const profile =
        data.profile || data.user || {};

      setForm({
        businessName:
          profile.businessName || "",
        businessMobile:
          profile.businessMobile || "",
        businessAddress:
          profile.businessAddress || "",
        upiId: profile.upiId || "",
      });
    } catch (err) {
      console.error(
        "Load profile failed:",
        err
      );

      setError(
        getMessage(
          "Unable to connect to server.",
          "सर्वर से कनेक्ट नहीं हो सका।"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.businessName.trim()) {
      setError(
        getMessage(
          "Business name is required.",
          "व्यापार / दुकान का नाम आवश्यक है।"
        )
      );
      return;
    }

    if (!form.businessMobile.trim()) {
      setError(
        getMessage(
          "Business mobile number is required.",
          "व्यापार मोबाइल नंबर आवश्यक है।"
        )
      );
      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        form.businessMobile.trim()
      )
    ) {
      setError(
        getMessage(
          "Please enter a valid 10-digit mobile number.",
          "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।"
        )
      );
      return;
    }

    if (!form.businessAddress.trim()) {
      setError(
        getMessage(
          "Business address is required.",
          "व्यापार का पता आवश्यक है।"
        )
      );
      return;
    }

    if (!form.upiId.trim()) {
      setError(
        getMessage(
          "UPI ID is required.",
          "UPI ID आवश्यक है।"
        )
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName:
              form.businessName.trim(),
            businessMobile:
              form.businessMobile.trim(),
            businessAddress:
              form.businessAddress.trim(),
            upiId: form.upiId.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            getMessage(
              "Unable to save business profile.",
              "व्यापार प्रोफ़ाइल सेव नहीं हो सकी।"
            )
        );
        return;
      }

      setMessage(
        getMessage(
          "Business profile saved successfully.",
          "व्यापार प्रोफ़ाइल सफलतापूर्वक सेव हो गई।"
        )
      );
    } catch (err) {
      console.error(
        "Save profile failed:",
        err
      );

      setError(
        getMessage(
          "Unable to connect to server.",
          "सर्वर से कनेक्ट नहीं हो सका।"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>{t("businessProfile")}</h1>

        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ marginBottom: "8px" }}>
            {t("businessProfile")}
          </h1>

          <p
            style={{
              color: "#666",
              margin: 0,
            }}
          >
            {getMessage(
              "Add your shop details for payment reminders and QR payments.",
              "भुगतान रिमाइंडर और QR भुगतान के लिए अपनी दुकान की जानकारी जोड़ें।"
            )}
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          {message && (
            <div
              style={{
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "8px",
                background: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "8px",
                background: "#ffebee",
                color: "#c62828",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="businessName"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                {t("businessName")}
              </label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                placeholder={getMessage(
                  "Example: Aditya Enterprises & CSC Center",
                  "उदाहरण: Aditya Enterprises & CSC Center"
                )}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="businessMobile"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                {t("businessMobile")}
              </label>

              <input
                id="businessMobile"
                name="businessMobile"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                value={form.businessMobile}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "businessMobile",
                      value:
                        e.target.value.replace(
                          /\D/g,
                          ""
                        ),
                    },
                  })
                }
                placeholder={getMessage(
                  "10-digit mobile number",
                  "10 अंकों का मोबाइल नंबर"
                )}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="businessAddress"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                {t("businessAddress")}
              </label>

              <textarea
                id="businessAddress"
                name="businessAddress"
                rows="3"
                value={form.businessAddress}
                onChange={handleChange}
                placeholder={getMessage(
                  "Enter your shop/business address",
                  "अपनी दुकान / व्यापार का पता दर्ज करें"
                )}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <label
                htmlFor="upiId"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                {t("upiId")}
              </label>

              <input
                id="upiId"
                name="upiId"
                type="text"
                value={form.upiId}
                onChange={handleChange}
                placeholder={getMessage(
                  "Example: yourname@upi",
                  "उदाहरण: yourname@upi"
                )}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#777",
                }}
              >
                {getMessage(
                  "This UPI ID will be used to create payment links and QR payments.",
                  "इस UPI ID का उपयोग भुगतान लिंक और QR भुगतान बनाने के लिए किया जाएगा।"
                )}
              </small>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "8px",
                background: saving
                  ? "#9e9e9e"
                  : "#0f9d58",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? getMessage(
                    "Saving...",
                    "सेव हो रहा है..."
                  )
                : getMessage(
                    "Save Business Profile",
                    "व्यापार प्रोफ़ाइल सेव करें"
                  )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;