import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../tests/helpers/renderWithProviders";
import { Sidebar } from "./Sidebar";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { useAuth } = await import("@/features/auth/context/AuthContext");

describe("Sidebar role-based nav", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "u@x.com", role: "READONLY" },
      role: "READONLY",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuth>);
  });

  it("READONLY role cannot see admin-only link", () => {
    renderWithProviders(
      <Sidebar collapsed={false} onToggleCollapsed={() => {}} />,
      { initialRoute: "/app" }
    );

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /example/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
  });

  it("ADMIN role can see admin link", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "a@x.com", role: "ADMIN" },
      role: "ADMIN",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuth>);

    renderWithProviders(
      <Sidebar collapsed={false} onToggleCollapsed={() => {}} />,
      { initialRoute: "/app" }
    );

    expect(screen.getByRole("link", { name: /admin/i })).toBeInTheDocument();
  });
});
