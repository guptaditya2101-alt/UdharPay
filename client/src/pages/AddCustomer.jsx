import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addCustomer } from "../services/customerService";
import { t } from "../utils/translations";
import "../styles/Form.css";

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AddCustomer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    totalAmount: "",
    creditDate: getTodayDate(),
    dueDate: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobile") {
      const onlyNumbers = value.replace(/\D/g, "");

      setFormData((previousData) => ({
        ...previousData,
        mobile: onlyNumbers,
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    const name = formData.name.trim();
    const mobile = formData.mobile.trim();
    const address = formData.address.trim();
    const totalAmount = Number(formData.totalAmount);
    const creditDate = formData.creditDate;
    const dueDate = formData.dueDate;

    if (!name) {
      setMessage(
        getErrorMessage("Please enter customer name.", "कृपया ग्राहक का नाम दर्ज करें।")
      );
      return;
    }

    if (mobile.length !== 10) {
      setMessage(
        getErrorMessage(
          "Please enter a valid 10-digit mobile number.",
          "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।"
        )
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage(
        getErrorMessage(
          "Please enter a valid Indian mobile number.",
          "कृपया सही भारतीय मोबाइल नंबर दर्ज करें।"
        )
      );
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setMessage(
        getErrorMessage(
          "Please enter a valid amount greater than 0.",
          "कृपया 0 से अधिक सही राशि दर्ज करें।"
        )
      );
      return;
    }

    if (!creditDate) {
      setMessage(
        getErrorMessage(
          "Please select udhar date.",
          "कृपया उधार लेने की तारीख चुनें।"
        )
      );
      return;
    }

    if (dueDate && dueDate < creditDate) {
      setMessage(
        getErrorMessage(
          "Due date cannot be before udhar date.",
          "भुगतान की अंतिम तारीख उधार लेने की तारीख से पहले नहीं हो सकती।"
        )
      );
      return;
    }

    setLoading(true);

    try {
      const result = await addCustomer({
        name,
        mobile,
        address,
        totalAmount,
        creditDate,
        dueDate,
      });

      if (!result.success) {
        setMessage(
          result.message ||
            getErrorMessage(
              "Failed to add customer.",
              "ग्राहक जोड़ने में समस्या हुई।"
            )
        );
        return;
      }

      navigate("/customers");
    } catch (error) {
      console.error("Add customer error:", error);

      setMessage(
        getErrorMessage(
          "Unable to connect to server.",
          "सर्वर से कनेक्ट नहीं हो सका।"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (english, hindi) => {
    const language =
      localStorage.getItem("udharpay_language") || "en";

    return language === "hi" ? hindi : english;
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <div>
          <h1>{t("addCustomer")}</h1>

          <p>
            {getErrorMessage(
              "Add a new customer and track their udhar.",
              "नया ग्राहक जोड़ें और उसका उधार ट्रैक करें।"
            )}
          </p>
        </div>
      </div>

      <div className="form-card">
        {message && (
          <div className="form-error">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                {getErrorMessage(
                  "Customer Name",
                  "ग्राहक का नाम"
                )}
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder={getErrorMessage(
                  "Enter customer name",
                  "ग्राहक का नाम दर्ज करें"
                )}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">
                {t("mobile")}
              </label>

              <input
                id="mobile"
                type="tel"
                name="mobile"
                placeholder={getErrorMessage(
                  "Enter 10-digit mobile number",
                  "10 अंकों का मोबाइल नंबर दर्ज करें"
                )}
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              {t("address")}
            </label>

            <textarea
              id="address"
              name="address"
              placeholder={getErrorMessage(
                "Enter customer address",
                "ग्राहक का पता दर्ज करें"
              )}
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalAmount">
                {getErrorMessage(
                  "Total Udhar Amount",
                  "कुल उधार राशि"
                )}
              </label>

              <input
                id="totalAmount"
                type="number"
                name="totalAmount"
                placeholder={getErrorMessage(
                  "Enter amount",
                  "राशि दर्ज करें"
                )}
                value={formData.totalAmount}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="creditDate">
                {t("udharLiyaDate")}
              </label>

              <input
                id="creditDate"
                type="date"
                name="creditDate"
                value={formData.creditDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">
              {t("dueDate")}
            </label>

            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={formData.creditDate}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/customers")}
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? getErrorMessage("Adding...", "जोड़ा जा रहा है...")
                : t("addCustomer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;