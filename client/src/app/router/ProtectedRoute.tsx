import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { useAuth } from "@/features/auth/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
