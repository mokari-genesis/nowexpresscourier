import type { Role } from "@/app/config/roles";
import { useAuth } from "@/features/auth/context/AuthContext";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

/**
 * Renders children only if the current user has one of the allowed roles.
 */
export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
