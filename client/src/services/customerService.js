import { getAuthHeaders } from "./authService";

const API_URL =
  import.meta.env.VITE_API_URL || "https://udharpay-server.onrender.com/api";

// =========================
// GET ALL CUSTOMERS
// =========================

export const getCustomers = async () => {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return data.customers || [];
  } catch (error) {
    console.error("Get customers failed:", error);
    return [];
  }
};

// =========================
// GET CUSTOMER BY ID
// =========================

export const getCustomerById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return data.customer || null;
  } catch (error) {
    console.error("Get customer failed:", error);
    return null;
  }
};

// =========================
// ADD CUSTOMER
// =========================

export const addCustomer = async (customerData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: customerData.name?.trim() || "",
        mobile: customerData.mobile || "",
        address: customerData.address?.trim() || "",
        totalAmount: Number(customerData.totalAmount),
        creditDate: customerData.creditDate || "",
        dueDate: customerData.dueDate || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to add customer.",
      };
    }

    return data;
  } catch (error) {
    console.error("Add customer failed:", error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
};

// =========================
// UPDATE CUSTOMER
// =========================

export const updateCustomer = async (id, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: updatedData.name?.trim() || "",
        mobile: updatedData.mobile || "",
        address: updatedData.address?.trim() || "",
        totalAmount: Number(updatedData.totalAmount),
        creditDate: updatedData.creditDate || "",
        dueDate: updatedData.dueDate || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to update customer.",
      };
    }

    return data;
  } catch (error) {
    console.error("Update customer failed:", error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
};

// =========================
// DELETE CUSTOMER
// =========================

export const deleteCustomer = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to delete customer.",
      };
    }

    return data;
  } catch (error) {
    console.error("Delete customer failed:", error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
};