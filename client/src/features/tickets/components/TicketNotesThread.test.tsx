import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../tests/helpers/renderWithProviders";
import { TicketNotesThread } from "./TicketNotesThread";

describe("TicketNotesThread", () => {
  it("keeps draft text when onAddNote fails", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn().mockRejectedValue(new Error("save failed"));

    renderWithProviders(
      <TicketNotesThread notes={[]} onAddNote={onAddNote} />
    );

    const textarea = screen.getByPlaceholderText(
      /escriba una actualización operativa/i
    );
    await user.type(textarea, "Nota que no debe borrarse");
    await user.click(screen.getByRole("button", { name: /agregar nota/i }));

    await waitFor(() => {
      expect(onAddNote).toHaveBeenCalled();
    });

    expect(textarea).toHaveValue("Nota que no debe borrarse");
  });

  it("clears draft text after a successful add", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <TicketNotesThread notes={[]} onAddNote={onAddNote} />
    );

    const textarea = screen.getByPlaceholderText(
      /escriba una actualización operativa/i
    );
    await user.type(textarea, "Nota guardada");
    await user.click(screen.getByRole("button", { name: /agregar nota/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});
