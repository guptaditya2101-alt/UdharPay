import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomerById } from "../services/customerService";
import {
  getPayments,
  getRemainingAmount,
  addPayment,
} from "../services/paymentService";
import { t } from "../utils/translations";

const getMessage = (english, hindi) => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  return language === "hi" ? hindi : english;
};

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const customerData = await getCustomerById(id);

        if (!customerData) {
          setError(
            getMessage(
              "Customer not found.",
              "ग्राहक नहीं मिला।"
            )
          );
          return;
        }

        const paymentData = await getPayments(id);

        const customerWithPayments = {
          ...customerData,
          payments: paymentData,
        };

        setCustomer(customerWithPayments);

        setRemainingAmount(
          getRemainingAmount(customerWithPayments)
        );
      } catch (error) {
        console.error("Payment page error:", error);

        setError(
          getMessage(
            "Unable to load payment page.",
            "भुगतान पेज लोड नहीं हो सका।"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setError(
        getMessage(
          "Please enter a valid payment amount.",
          "कृपया सही भुगतान राशि दर्ज करें।"
        )
      );
      return;
    }

    if (paymentAmount > remainingAmount) {
      setError(
        getMessage(
          `Payment cannot be greater than remaining amount of ₹${remainingAmount}.`,
          `भुगतान बाकी राशि ₹${remainingAmount} से अधिक नहीं हो सकता।`
        )
      );
      return;
    }

    if (!date) {
      setError(
        getMessage(
          "Please select payment date.",
          "कृपया भुगतान की तारीख चुनें।"
        )
      );
      return;
    }

    setSaving(true);

    try {
      await addPayment(id, paymentAmount, date);

      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Add payment error:", error);

      setError(
        getMessage(
          "Failed to add payment.",
          "भुगतान जोड़ने में समस्या हुई।"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          {getMessage(
            "Loading payment page...",
            "भुगतान पेज लोड हो रहा है..."
          )}
        </h2>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          {t("customerNotFound")}
        </h2>

        {error && (
          <p className="mt-2 text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={() => navigate("/customers")}
          className="mt-4 rounded bg-green-600 px-4 py-2 text-white"
        >
          {t("backToCustomers")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          {t("addPayment")}
        </h1>

        <p className="mb-6 text-gray-600">
          {getMessage("Customer:", "ग्राहक:")}{" "}
          <strong>{customer.name}</strong>
        </p>

        <div className="mb-6 rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            {t("totalUdhar")}
          </p>

          <p className="text-xl font-bold">
            ₹{Number(customer.totalAmount || 0)}
          </p>

          <p className="mt-3 text-sm text-gray-600">
            {t("remaining")}
          </p>

          <p className="text-xl font-bold text-red-600">
            ₹{remainingAmount}
          </p>
        </div>

        {remainingAmount <= 0 ? (
          <div className="rounded-lg bg-green-100 p-4 text-green-700">
            {getMessage(
              "This customer has no pending amount.",
              "इस ग्राहक की कोई बाकी राशि नहीं है।"
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2 block font-medium">
                {getMessage(
                  "Payment Amount",
                  "भुगतान राशि"
                )}
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder={getMessage(
                  "Enter payment amount",
                  "भुगतान राशि दर्ज करें"
                )}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                disabled={saving}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block font-medium">
                {getMessage(
                  "Payment Date",
                  "भुगतान की तारीख"
                )}
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving
                  ? getMessage(
                      "Adding...",
                      "जोड़ा जा रहा है..."
                    )
                  : t("addPayment")}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate(`/customers/${id}`)
                }
                className="rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Payment;