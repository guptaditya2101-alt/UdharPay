import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

const AuthLayout = () => {
  // अगर user पहले से login है तो Dashboard पर भेजो
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;