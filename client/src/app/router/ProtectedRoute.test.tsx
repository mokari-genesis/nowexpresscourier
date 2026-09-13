import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../tests/helpers/renderWithProviders";
import { ProtectedRoute } from "./ProtectedRoute";

// Mock AuthContext so we can control isAuthenticated
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { useAuth } = await import("@/features/auth/context/AuthContext");

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuth>);
  });

  it("redirects unauthenticated user from /app/dashboard to /login", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuth>);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard</div>
      </ProtectedRoute>,
      { initialRoute: "/app/dashboard" }
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "u@x.com", role: "USER" },
      role: "USER",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuth>);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard</div>
      </ProtectedRoute>,
      { initialRoute: "/app/dashboard" }
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
