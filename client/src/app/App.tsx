import { RouterProvider } from "react-router-dom";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { AuthTokenProvider } from "@/app/providers/AuthTokenProvider";
import { router } from "@/app/router/routes";
import { Toaster } from "@/shared/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthTokenProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthTokenProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
