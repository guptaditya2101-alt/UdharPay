import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
import AddCustomer from "./pages/AddCustomer";
import CustomerDetails from "./pages/CustomerDetails";
import EditCustomer from "./pages/EditCustomer";
import Payment from "./pages/Payment";
import BusinessProfile from "./pages/BusinessProfile";
import LanguageSelection from "./pages/LanguageSelection";
import NotFound from "./pages/NotFound";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

const App = () => {
  const language =
    localStorage.getItem("udharpay_language");

  if (!language) {
    return (
      <Routes>
        <Route
          path="*"
          element={<LanguageSelection />}
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/customers"
            element={<CustomerList />}
          />

          <Route
            path="/add-customer"
            element={<AddCustomer />}
          />

          <Route
            path="/customers/:id"
            element={<CustomerDetails />}
          />

          <Route
            path="/customers/:id/edit"
            element={<EditCustomer />}
          />

          <Route
            path="/customers/:id/payment"
            element={<Payment />}
          />

          <Route
            path="/business-profile"
            element={<BusinessProfile />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default App;