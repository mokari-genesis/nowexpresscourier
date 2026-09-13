import { useEffect } from "react";
import { setAuthTokenGetter } from "@/services/http/client";
import { useAuth } from "@/features/auth/context/AuthContext";

/**
 * Wires AuthContext token into the HTTP client.
 * In a real app you would pass a real token from your auth backend.
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => {
      if (!isAuthenticated || !user) return null;
      // Template: fake token for demo. Replace with real token from your auth flow.
      return `fake-token-${user.id}`;
    });
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
