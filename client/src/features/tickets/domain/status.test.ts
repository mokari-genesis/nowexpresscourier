import { describe, expect, it } from "vitest";
import {
  canTransitionTo,
  getAllowedNextStatuses,
  getPrimaryTransitionAction,
} from "./status";

describe("ticket status transitions", () => {
  it("allows the linear happy path", () => {
    expect(getAllowedNextStatuses("open")).toEqual(["in_progress"]);
    expect(getAllowedNextStatuses("in_progress")).toEqual(["resolved"]);
    expect(getAllowedNextStatuses("resolved")).toEqual(["closed"]);
    expect(getAllowedNextStatuses("closed")).toEqual([]);
  });

  it("rejects skipping statuses", () => {
    expect(canTransitionTo("open", "resolved")).toBe(false);
    expect(canTransitionTo("open", "closed")).toBe(false);
    expect(canTransitionTo("in_progress", "closed")).toBe(false);
  });

  it("returns a primary action for non-terminal statuses", () => {
    expect(getPrimaryTransitionAction("open")).toEqual({
      nextStatus: "in_progress",
      label: "Marcar en progreso",
    });
    expect(getPrimaryTransitionAction("in_progress")).toEqual({
      nextStatus: "resolved",
      label: "Resolver ticket",
    });
    expect(getPrimaryTransitionAction("closed")).toBeNull();
  });
});
