import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function RoleProtected({ roles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}