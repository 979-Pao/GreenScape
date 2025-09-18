import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

export default function PrivateRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.some(r => (user?.roles || []).includes(r))) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
