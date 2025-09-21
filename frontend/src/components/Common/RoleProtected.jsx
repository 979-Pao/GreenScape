import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function RoleProtected({ roles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  if (roles.length && !roles.some(r => userRoles.includes(r))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
