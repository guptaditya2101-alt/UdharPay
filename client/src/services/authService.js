const CURRENT_USER_KEY = "udharpay_current_user";
const TOKEN_KEY = "udharpay_token";
const API_URL = "https://udharpay-server.onrender.com/api"; 

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed.",
      };
    }

    return {
      success: true,
      message: data.message || "Account created successfully.",
    };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Invalid email or password.",
      };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_KEY, data.token);

    return {
      success: true,
      message: data.message || "Login successful.",
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem(CURRENT_USER_KEY) &&
    localStorage.getItem(TOKEN_KEY)
  );
};

export const getAuthHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const handleUnauthorized = () => {
  logoutUser();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};