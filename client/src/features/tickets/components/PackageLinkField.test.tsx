import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../tests/helpers/renderWithProviders";
import { PackageLinkField } from "./PackageLinkField";

vi.mock("../api/useTicketQueries", () => ({
  usePackageSearchQuery: () => ({
    data: undefined,
    isLoading: true,
    isFetching: true,
  }),
}));

describe("PackageLinkField", () => {
  it("shows loading state instead of empty results while fetching", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PackageLinkField value={null} onChange={() => undefined} />
    );

    await user.click(
      screen.getByPlaceholderText(/buscar por guía o cliente/i)
    );

    expect(screen.getByText(/buscando/i)).toBeInTheDocument();
    expect(screen.queryByText(/sin resultados/i)).not.toBeInTheDocument();
  });
});
