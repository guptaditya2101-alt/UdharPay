import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import { getCustomerById } from "../services/customerService";
import {
  getPayments,
  getRemainingAmount,
  getTotalPaidAmount,
  deletePayment,
} from "../services/paymentService";
import { getAuthHeaders } from "../services/authService";
import { t } from "../utils/translations";

const getMessage = (english, hindi) => {
  const language =
    localStorage.getItem("udharpay_language") || "en";

  return language === "hi" ? hindi : english;
};

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const customerData = await getCustomerById(id);

      if (!customerData) {
        setMessage(
          getMessage(
            "Customer not found.",
            "ग्राहक नहीं मिला।"
          )
        );
        setCustomer(null);
        return;
      }

      const paymentData = await getPayments(id);

      setCustomer(customerData);
      setPayments(paymentData);

      try {
        const profileResponse = await fetch(
          "http://192.168.1.38:5000/api/profile",
          {
            headers: getAuthHeaders(),
          }
        );

        const profileData =
          await profileResponse.json();

        if (
          profileResponse.ok &&
          profileData.profile
        ) {
          setProfile(profileData.profile);
        }
      } catch (profileError) {
        console.error(
          "Business profile load failed:",
          profileError
        );
      }
    } catch (error) {
      console.error(
        "Customer details error:",
        error
      );

      setMessage(
        getMessage(
          "Unable to load customer details.",
          "ग्राहक की जानकारी लोड नहीं हो सकी।"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const totalAmount = Number(
    customer?.totalAmount || 0
  );

  const totalPaid = getTotalPaidAmount({
    ...customer,
    payments,
  });

  const remainingAmount = getRemainingAmount({
    ...customer,
    payments,
  });

  const calculateDaysSinceUdhar = () => {
    if (!customer?.creditDate) {
      return null;
    }

    const creditDate = new Date(
      `${customer.creditDate}T00:00:00`
    );

    const today = new Date();

    creditDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const difference =
      today.getTime() - creditDate.getTime();

    return Math.max(
      0,
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      )
    );
  };

  const daysSinceUdhar =
    calculateDaysSinceUdhar();

  const handleDeletePayment = async (
    paymentId
  ) => {
    const confirmed = window.confirm(
      getMessage(
        "Are you sure you want to delete this payment?",
        "क्या आप इस भुगतान को हटाना चाहते हैं?"
      )
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deletePayment(
        id,
        paymentId
      );

      if (result?.success === false) {
        alert(
          result.message ||
            getMessage(
              "Failed to delete payment.",
              "भुगतान हटाया नहीं जा सका।"
            )
        );
        return;
      }

      await loadCustomerData();

      alert(
        getMessage(
          "Payment deleted successfully.",
          "भुगतान सफलतापूर्वक हटा दिया गया।"
        )
      );
    } catch (error) {
      console.error(
        "Delete payment error:",
        error
      );

      alert(
        getMessage(
          "Failed to delete payment.",
          "भुगतान हटाया नहीं जा सका।"
        )
      );
    }
  };

  const createUpiLink = () => {
    if (
      !profile?.upiId ||
      remainingAmount <= 0
    ) {
      return "";
    }

    const businessName =
      profile.businessName ||
      "UdharPay Business";

    return (
      `upi://pay?pa=${encodeURIComponent(
        profile.upiId
      )}` +
      `&pn=${encodeURIComponent(
        businessName
      )}` +
      `&am=${encodeURIComponent(
        remainingAmount.toFixed(2)
      )}` +
      `&cu=INR`
    );
  };

  const handleShowQR = () => {
    if (remainingAmount <= 0) {
      alert(
        getMessage(
          "This customer has no pending amount.",
          "इस ग्राहक की कोई बाकी राशि नहीं है।"
        )
      );
      return;
    }

    if (!profile?.upiId) {
      alert(
        getMessage(
          "Please add your UPI ID in Business Profile first.",
          "कृपया पहले Business Profile में अपना UPI ID जोड़ें।"
        )
      );
      return;
    }

    setShowQR(true);
  };

 const getReminderMessage = () => {
  const businessName =
    profile?.businessName ||
    "UdharPay Business";

  const businessMobile =
    profile?.businessMobile ||
    "उपलब्ध नहीं / Not available";

  const businessAddress =
    profile?.businessAddress ||
    "उपलब्ध नहीं / Not available";

  const upiId =
    profile?.upiId ||
    "सेट नहीं है / Not configured";

  const creditDate =
    customer.creditDate ||
    "उपलब्ध नहीं / Not available";

  const dueDate =
    customer.dueDate ||
    "सेट नहीं है / Not set";

  const todayDate =
    new Date()
      .toISOString()
      .split("T")[0];

  const paymentLink =
    createUpiLink();

  return `🟢 ${businessName}

━━━━━━━━━━━━━━━━
उधार भुगतान रिमाइंडर
UdharPay – Payment Reminder
━━━━━━━━━━━━━━━━

नमस्ते ${customer.name} जी 🙏
Namaste ${customer.name} ji 🙏

यह संदेश आपके उधार भुगतान की याद दिलाने के लिए भेजा गया है।
This is a reminder regarding your pending udhar payment.

उधार की जानकारी:
Udhar Details:

• कुल उधार: ₹${totalAmount}
  Total Udhar: ₹${totalAmount}

• अब तक भुगतान: ₹${totalPaid}
  Paid Amount: ₹${totalPaid}

• बाकी राशि: ₹${remainingAmount}
  Remaining Amount: ₹${remainingAmount}

• उधार लेने की तारीख: ${creditDate}
  Udhar Taken Date: ${creditDate}

• भुगतान की अंतिम तारीख: ${dueDate}
  Due Date: ${dueDate}

• उधार की अवधि: ${daysSinceUdhar ?? "—"} दिन
  Udhar Duration: ${daysSinceUdhar ?? "—"} days

• आज की तारीख: ${todayDate}
  Today's Date: ${todayDate}


दुकान की जानकारी:
Shop Details:

• दुकान का नाम: ${businessName}
  Shop Name: ${businessName}

• मोबाइल: ${businessMobile}
  Mobile: ${businessMobile}

• पता: ${businessAddress}
  Address: ${businessAddress}


भुगतान की जानकारी:
Payment Details:

• UPI ID: ${upiId}
  UPI ID: ${upiId}

• भुगतान राशि: ₹${remainingAmount}
  Payment Amount: ₹${remainingAmount}

${
  paymentLink
    ? `• भुगतान लिंक: ${paymentLink}
  Payment Link: ${paymentLink}`
    : ""
}


कृपया अपनी बाकी राशि का भुगतान कर दें।
Please clear your pending amount.

धन्यवाद। 🙏
Thank you. 🙏

— ${businessName}`;
};

  const createQrImageFile = async () => {
    const svgElement =
      document.querySelector(
        "#udharpay-payment-qr svg"
      );

    if (!svgElement) {
      throw new Error(
        "QR code is not available."
      );
    }

    const serializer =
      new XMLSerializer();

    const svgString =
      serializer.serializeToString(
        svgElement
      );

    const svgBlob = new Blob(
      [svgString],
      {
        type: "image/svg+xml;charset=utf-8",
      }
    );

    const svgUrl =
      URL.createObjectURL(svgBlob);

    try {
      const image =
        new Image();

      await new Promise(
        (resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = svgUrl;
        }
      );

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = 600;
      canvas.height = 600;

      const context =
        canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        50,
        50,
        500,
        500
      );

      return await new Promise(
        (resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/png"
          );
        }
      );
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  const handleWhatsAppWithQR = async () => {
    if (remainingAmount <= 0) {
      alert(
        getMessage(
          "This customer has no pending amount.",
          "इस ग्राहक की कोई बाकी राशि नहीं है।"
        )
      );
      return;
    }

    if (!profile?.upiId) {
      alert(
        getMessage(
          "Please add your UPI ID in Business Profile first.",
          "कृपया पहले Business Profile में अपना UPI ID जोड़ें।"
        )
      );
      return;
    }

    const mobile = String(
      customer.mobile || ""
    ).replace(/\D/g, "");

    if (!mobile) {
      alert(
        getMessage(
          "Customer mobile number is not available.",
          "ग्राहक का मोबाइल नंबर उपलब्ध नहीं है।"
        )
      );
      return;
    }

    const reminderMessage =
      getReminderMessage();

    try {
      const qrBlob =
        await createQrImageFile();

      if (!qrBlob) {
        throw new Error(
          "QR image could not be created."
        );
      }

      const qrFile = new File(
        [qrBlob],
        "UdharPay-Payment-QR.png",
        {
          type: "image/png",
        }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [qrFile],
        })
      ) {
        await navigator.share({
          title: getMessage(
            "UdharPay Payment Reminder",
            "UdharPay भुगतान रिमाइंडर"
          ),
          text: reminderMessage,
          files: [qrFile],
        });

        return;
      }

      const mobileNumber =
        mobile.length === 10
          ? `91${mobile}`
          : mobile;

      const whatsappUrl =
        `https://wa.me/${mobileNumber}?text=` +
        encodeURIComponent(
          reminderMessage
        );

      window.open(
        whatsappUrl,
        "_blank"
      );

      alert(
        getMessage(
          "Your browser does not support sharing the QR image directly. The WhatsApp message has been opened. You can share the QR image separately from the Payment QR section.",
          "आपका ब्राउज़र QR इमेज को सीधे शेयर करने की सुविधा नहीं देता। WhatsApp संदेश खोल दिया गया है। QR इमेज को Payment QR सेक्शन से अलग से शेयर कर सकते हैं।"
        )
      );
    } catch (error) {
      console.error(
        "WhatsApp QR share failed:",
        error
      );

      openWhatsAppOnly();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          {getMessage(
            "Loading customer...",
            "ग्राहक की जानकारी लोड हो रही है..."
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

        {message && (
          <p className="mt-2 text-red-600">
            {message}
          </p>
        )}

        <button
          onClick={() =>
            navigate("/customers")
          }
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white"
        >
          {t("backToCustomers")}
        </button>
      </div>
    );
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const dueDate = customer.dueDate
    ? new Date(
        `${customer.dueDate}T00:00:00`
      )
    : null;

  const paymentStatus =
    remainingAmount <= 0
      ? "Paid"
      : dueDate && dueDate < today
      ? "Overdue"
      : "Pending";

  const paymentStatusLabel =
    paymentStatus === "Paid"
      ? t("paid")
      : paymentStatus === "Overdue"
      ? t("overdue")
      : t("pending");

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* HEADER */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {customer.name}
          </h1>

          <p className="text-gray-600">
            {customer.mobile}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              navigate(
                `/customers/${id}/edit`
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t("edit")}
          </button>

          <button
            onClick={() =>
              navigate(
                `/customers/${id}/payment`
              )
            }
            disabled={
              remainingAmount <= 0
            }
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {t("addPayment")}
          </button>

          <button
            onClick={handleShowQR}
            disabled={
              remainingAmount <= 0
            }
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            📱 {t("paymentQR")}
          </button>

          <button
            onClick={
              handleWhatsAppWithQR
            }
            disabled={
              remainingAmount <= 0
            }
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            📲{" "}
            {getMessage(
              "WhatsApp + QR",
              "WhatsApp + QR"
            )}
          </button>
        </div>
      </div>

      {/* AMOUNT CARDS */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            {t("totalUdhar")}
          </p>

          <p className="mt-1 text-2xl font-bold">
            ₹{totalAmount}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            {t("totalPaid")}
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            ₹{totalPaid}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            {t("remaining")}
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            ₹{remainingAmount}
          </p>
        </div>
      </div>

      {/* HIDDEN QR FOR SHARING */}

      {profile?.upiId &&
        remainingAmount > 0 && (
          <div
            id="udharpay-payment-qr"
            style={{
              position: "absolute",
              left: "-10000px",
              top: "-10000px",
              width: "300px",
              height: "300px",
              background: "#ffffff",
            }}
          >
            <QRCodeSVG
              value={createUpiLink()}
              size={300}
              level="M"
              includeMargin={true}
            />
          </div>
        )}

      {/* PAYMENT QR */}

      {showQR && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {getMessage(
                  "Payment QR",
                  "भुगतान QR"
                )}
              </h2>

              <p className="mt-1 text-gray-600">
                {getMessage(
                  "Scan this QR to pay the remaining amount.",
                  "बाकी राशि का भुगतान करने के लिए इस QR को स्कैन करें।"
                )}
              </p>
            </div>

            <button
              onClick={() =>
                setShowQR(false)
              }
              className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
            >
              {getMessage(
                "Close",
                "बंद करें"
              )}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <QRCodeSVG
                value={createUpiLink()}
                size={260}
                level="M"
                includeMargin={true}
              />
            </div>

            <h3 className="mt-5 text-2xl font-bold">
              ₹{remainingAmount}
            </h3>

            <p className="mt-1 text-gray-600">
              {profile?.businessName ||
                "UdharPay Business"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              UPI ID: {profile?.upiId}
            </p>

            <button
              onClick={
                handleWhatsAppWithQR
              }
              className="mt-5 rounded-lg bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600"
            >
              📲{" "}
              {getMessage(
                "Share Message + QR",
                "मैसेज + QR शेयर करें"
              )}
            </button>

            <p className="mt-4 max-w-md text-center text-sm text-gray-500">
              {getMessage(
                `Customer can scan this QR using any UPI app and pay ₹${remainingAmount}.`,
                `ग्राहक किसी भी UPI ऐप से यह QR स्कैन करके ₹${remainingAmount} का भुगतान कर सकता है।`
              )}
            </p>
          </div>
        </div>
      )}

      {/* CUSTOMER INFORMATION */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {t("customerInformation")}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : paymentStatus ===
                  "Overdue"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {paymentStatusLabel}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              {t("mobile")}
            </p>

            <p className="font-medium">
              {customer.mobile ||
                t("notAvailable")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {t("udharLiyaDate")}
            </p>

            <p className="font-medium">
              {customer.creditDate ||
                t("notAvailable")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {t("dueDate")}
            </p>

            <p className="font-medium">
              {customer.dueDate ||
                t("notSet")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {t("udharDuration")}
            </p>

            <p className="font-medium">
              {daysSinceUdhar !== null
                ? `${daysSinceUdhar} ${getMessage(
                    "days",
                    "दिन"
                  )}`
                : t("notAvailable")}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">
              {t("address")}
            </p>

            <p className="font-medium">
              {customer.address ||
                t("notAvailable")}
            </p>
          </div>
        </div>
      </div>

      {/* BUSINESS PROFILE */}

      {profile && (
        <div className="mb-6 rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">
            {t("businessDetails")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                {t("businessName")}
              </p>

              <p className="font-medium">
                {profile.businessName ||
                  getMessage(
                    "Not configured",
                    "सेट नहीं है"
                  )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {t("businessMobile")}
              </p>

              <p className="font-medium">
                {profile.businessMobile ||
                  getMessage(
                    "Not configured",
                    "सेट नहीं है"
                  )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {t("upiId")}
              </p>

              <p className="font-medium">
                {profile.upiId ||
                  getMessage(
                    "Not configured",
                    "सेट नहीं है"
                  )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                {t("businessAddress")}
              </p>

              <p className="font-medium">
                {profile.businessAddress ||
                  getMessage(
                    "Not configured",
                    "सेट नहीं है"
                  )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY */}

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">
          {t("paymentHistory")}
        </h2>

        {payments.length === 0 ? (
          <div className="rounded-lg bg-gray-100 p-5 text-center text-gray-600">
            {t("noPayments")}
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(
              (payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-green-600">
                      ₹
                      {Number(
                        payment.amount || 0
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {getMessage(
                        "Date:",
                        "तारीख:"
                      )}{" "}
                      {payment.paymentDate ||
                        payment.date ||
                        t("notAvailable")}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDeletePayment(
                        payment.id
                      )
                    }
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                  >
                    {t("delete")}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* BACK BUTTON */}

      <button
        onClick={() =>
          navigate("/customers")
        }
        className="mt-6 rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-300"
      >
        {t("backToCustomers")}
      </button>
    </div>
  );
}

export default CustomerDetails;