import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCustomerById,
  updateCustomer,
} from "../services/customerService";
import { t } from "../utils/translations";
import "../styles/Form.css";

const getMessage = (english, hindi) => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  return language === "hi" ? hindi : english;
};

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    totalAmount: "",
    creditDate: "",
    dueDate: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);

        const customer = await getCustomerById(id);

        if (!customer) {
          setMessage(
            getMessage(
              "Customer not found.",
              "ग्राहक नहीं मिला।"
            )
          );
          return;
        }

        setFormData({
          name: customer.name || "",
          mobile: customer.mobile || "",
          address: customer.address || "",
          totalAmount: customer.totalAmount || "",
          creditDate: customer.creditDate || "",
          dueDate: customer.dueDate || "",
        });
      } catch (error) {
        console.error("Get customer error:", error);

        setMessage(
          getMessage(
            "Unable to load customer.",
            "ग्राहक की जानकारी लोड नहीं हो सकी।"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

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
        getMessage(
          "Please enter customer name.",
          "कृपया ग्राहक का नाम दर्ज करें।"
        )
      );
      return;
    }

    if (mobile.length !== 10) {
      setMessage(
        getMessage(
          "Please enter a valid 10-digit mobile number.",
          "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।"
        )
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage(
        getMessage(
          "Please enter a valid Indian mobile number.",
          "कृपया सही भारतीय मोबाइल नंबर दर्ज करें।"
        )
      );
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setMessage(
        getMessage(
          "Please enter a valid amount.",
          "कृपया सही राशि दर्ज करें।"
        )
      );
      return;
    }

    if (!creditDate) {
      setMessage(
        getMessage(
          "Please select udhar date.",
          "कृपया उधार लेने की तारीख चुनें।"
        )
      );
      return;
    }

    if (dueDate && dueDate < creditDate) {
      setMessage(
        getMessage(
          "Due date cannot be before udhar date.",
          "भुगतान की अंतिम तारीख उधार लेने की तारीख से पहले नहीं हो सकती।"
        )
      );
      return;
    }

    setSaving(true);

    try {
      const result = await updateCustomer(id, {
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
            getMessage(
              "Failed to update customer.",
              "ग्राहक की जानकारी अपडेट नहीं हो सकी।"
            )
        );
        return;
      }

      alert(
        getMessage(
          "Customer updated successfully.",
          "ग्राहक की जानकारी सफलतापूर्वक अपडेट हो गई।"
        )
      );

      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Update customer error:", error);

      setMessage(
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
      <div className="loader-container">
        <p>
          {getMessage(
            "Loading customer details...",
            "ग्राहक की जानकारी लोड हो रही है..."
          )}
        </p>
      </div>
    );
  }

  if (
    !formData.name &&
    message ===
      getMessage(
        "Customer not found.",
        "ग्राहक नहीं मिला।"
      )
  ) {
    return (
      <div className="empty-state">
        <h3>{t("customerNotFound")}</h3>

        <button
          type="button"
          className="submit-btn"
          onClick={() => navigate("/customers")}
        >
          {t("backToCustomers")}
        </button>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="page-header">
        <div>
          <h1>
            {getMessage(
              "Edit Customer",
              "ग्राहक की जानकारी संपादित करें"
            )}
          </h1>

          <p>
            {getMessage(
              "Update customer information and udhar details.",
              "ग्राहक की जानकारी और उधार का विवरण अपडेट करें।"
            )}
          </p>
        </div>
      </div>

      {message && (
        <div className="form-error">
          {message}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                {getMessage(
                  "Customer Name",
                  "ग्राहक का नाम"
                )}
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder={getMessage(
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
                placeholder={getMessage(
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
              placeholder={getMessage(
                "Enter customer address",
                "ग्राहक का पता दर्ज करें"
              )}
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount">
              {getMessage(
                "Total Udhar Amount",
                "कुल उधार राशि"
              )}
            </label>

            <input
              id="totalAmount"
              type="number"
              name="totalAmount"
              placeholder={getMessage(
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

          <div className="form-row">
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
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(`/customers/${id}`)
              }
              disabled={saving}
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={saving}
            >
              {saving
                ? getMessage(
                    "Updating...",
                    "अपडेट हो रहा है..."
                  )
                : getMessage(
                    "Update Customer",
                    "ग्राहक अपडेट करें"
                  )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;