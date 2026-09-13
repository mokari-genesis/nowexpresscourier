import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../tests/helpers/renderWithProviders";
import { ExampleListPage } from "./ExampleListPage";
import * as exampleRepo from "@/services/repositories/exampleRepo";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "1", email: "u@x.com", role: "USER" },
    role: "USER",
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ExampleListPage", () => {
  beforeEach(() => {
    vi.spyOn(exampleRepo.exampleRepo, "listExamples").mockResolvedValue([
      {
        id: "1",
        title: "First example",
        description: "First description",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        title: "Second example",
        description: "Second description",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ]);
  });

  it("renders items from repo and filters with search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleListPage />, {
      initialRoute: "/app/example",
    });

    await screen.findByRole("cell", { name: /first example/i });
    expect(screen.getByRole("cell", { name: /second example/i })).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by title or description/i);
    await user.type(searchInput, "First");

    await screen.findByRole("cell", { name: /first example/i });
    expect(exampleRepo.exampleRepo.listExamples).toHaveBeenCalledWith(
      expect.objectContaining({ search: "First" })
    );
  });
});
