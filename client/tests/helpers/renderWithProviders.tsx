import * as React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";

function createWrapper(initialRoute?: string, queryClient?: QueryClient) {
  const client = queryClient ?? new QueryClient({
    defaultOptions: {
      queries: { retry: 0 },
      mutations: { retry: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    const Router = initialRoute ? MemoryRouter : BrowserRouter;
    const routerProps = initialRoute
      ? { initialEntries: [initialRoute], initialIndex: 0 }
      : {};

    return (
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Router {...routerProps}>{children}</Router>
        </AuthProvider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: {
    initialRoute?: string;
    queryClient?: QueryClient;
  } & Omit<RenderOptions, "wrapper"> = {}
) {
  const { initialRoute, queryClient, ...renderOptions } = options;
  const Wrapper = createWrapper(initialRoute, queryClient);
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { createWrapper };
