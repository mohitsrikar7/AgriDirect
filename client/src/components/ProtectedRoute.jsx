import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  // 🚫 Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🚫 No roles
  if (!user.roles || !Array.isArray(user.roles)) {
    return <Navigate to="/" />;
  }

  // 🚫 Role mismatch (multi-role support)
  if (role && !user.roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
