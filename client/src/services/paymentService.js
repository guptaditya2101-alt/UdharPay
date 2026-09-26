import { getAuthHeaders } from "./authService";

const API_URL = "http://192.168.1.38:5000/api";

// =========================
// GET PAYMENTS
// =========================

export const getPayments = async (customerId) => {
  const response = await fetch(
    `${API_URL}/customers/${customerId}/payments`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to get payments."
    );
  }

  return result.payments || [];
};

// =========================
// TOTAL PAID AMOUNT
// =========================

export const getTotalPaidAmount = (customer) => {
  if (!customer) return 0;

  if (typeof customer.totalPaid !== "undefined") {
    return Number(customer.totalPaid || 0);
  }

  if (!Array.isArray(customer.payments)) {
    return 0;
  }

  return customer.payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );
};

// =========================
// REMAINING AMOUNT
// =========================

export const getRemainingAmount = (customer) => {
  if (!customer) return 0;

  if (typeof customer.remainingAmount !== "undefined") {
    return Number(customer.remainingAmount || 0);
  }

  const totalAmount = Number(
    customer.totalAmount || 0
  );

  const totalPaid = getTotalPaidAmount(customer);

  return Math.max(totalAmount - totalPaid, 0);
};

// =========================
// ADD PAYMENT
// =========================

export const addPayment = async (
  customerId,
  paymentAmount,
  paymentDate
) => {
  const response = await fetch(
    `${API_URL}/customers/${customerId}/payments`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: Number(paymentAmount),
        paymentDate,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to add payment."
    );
  }

  return result.payment;
};

// =========================
// DELETE PAYMENT
// =========================

export const deletePayment = async (
  customerId,
  paymentId
) => {
  const response = await fetch(
    `${API_URL}/customers/${customerId}/payments/${paymentId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to delete payment."
    );
  }

  return result;
};