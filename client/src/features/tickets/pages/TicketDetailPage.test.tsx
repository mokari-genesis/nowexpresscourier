import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../tests/helpers/renderWithProviders";
import { TicketDetailPage } from "./TicketDetailPage";
import * as ticketsRepoModule from "@/features/tickets/api/ticketsRepo";

const toast = vi.fn();

vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({ toast }),
}));

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

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "tkt-0142" }),
  };
});

const openTicket = {
  id: "tkt-0142",
  publicCode: "TKT-2026-0142",
  type: "reclamo" as const,
  status: "open" as const,
  priority: "high" as const,
  title: "Envío retenido",
  description: "Detalle de la incidencia para pruebas.",
  linkedPackage: {
    guideCode: "GUIA-10482",
    clientName: "Acme Corp",
    statusLabel: "En tránsito",
  },
  notes: [],
  attachments: [],
  createdAt: "2026-03-18T14:10:00Z",
  updatedAt: "2026-03-18T14:40:00Z",
};

describe("TicketDetailPage", () => {
  beforeEach(() => {
    toast.mockClear();
    vi.spyOn(ticketsRepoModule.ticketsRepo, "getTicket").mockResolvedValue(
      openTicket
    );
  });

  it("toasts Spanish status label when advancing", async () => {
    const user = userEvent.setup();
    vi.spyOn(ticketsRepoModule.ticketsRepo, "updateStatus").mockResolvedValue({
      ...openTicket,
      status: "in_progress",
    });

    renderWithProviders(<TicketDetailPage />, {
      initialRoute: "/app/tickets/tkt-0142",
    });

    await screen.findByText("Envío retenido");
    await user.click(
      screen.getByRole("button", { name: /marcar en progreso/i })
    );

    await waitFor(() => {
      expect(ticketsRepoModule.ticketsRepo.updateStatus).toHaveBeenCalledWith(
        "tkt-0142",
        "in_progress"
      );
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Ticket movido a En progreso.",
      })
    );
  });
});
