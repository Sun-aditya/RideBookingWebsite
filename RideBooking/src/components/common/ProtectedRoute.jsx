import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PageLoader from "./PageLoader";

export default function ProtectedRoute({ allowedRoles = ["rider", "driver", "admin"] }) {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
