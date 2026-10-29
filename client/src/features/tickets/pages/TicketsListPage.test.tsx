import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../tests/helpers/renderWithProviders";
import { TicketsListPage } from "./TicketsListPage";
import * as ticketsRepoModule from "@/features/tickets/api/ticketsRepo";

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

describe("TicketsListPage", () => {
  beforeEach(() => {
    vi.spyOn(ticketsRepoModule.ticketsRepo, "listTickets").mockResolvedValue({
      items: [
        {
          id: "tkt-0142",
          publicCode: "TKT-2026-0142",
          type: "reclamo",
          status: "in_progress",
          priority: "high",
          title: "Envío retenido por inconsistencia de dirección",
          description: "Detalle",
          linkedPackage: {
            guideCode: "GUIA-10482",
            clientName: "Acme Corp",
            statusLabel: "En tránsito",
          },
          notes: [],
          attachments: [],
          createdAt: "2026-03-18T14:10:00Z",
          updatedAt: "2026-03-18T14:40:00Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });

    vi.spyOn(ticketsRepoModule.ticketsRepo, "getKpis").mockResolvedValue({
      total: 42,
      openCount: 24,
      highPriorityCount: 6,
      avgResolutionLabel: "3h 48m",
      slaAtRiskCount: 3,
      fleetEffectivenessLabel: "97.2%",
    });
  });

  it("renders tickets and calls list with search filter", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TicketsListPage />, {
      initialRoute: "/app/tickets",
    });

    await screen.findByText("TKT-2026-0142");
    expect(
      screen.getByText("Envío retenido por inconsistencia de dirección")
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /buscar por código o título/i
    );
    await user.type(searchInput, "0142");

    expect(ticketsRepoModule.ticketsRepo.listTickets).toHaveBeenCalledWith(
      expect.objectContaining({ search: "0142" })
    );
  });
});
