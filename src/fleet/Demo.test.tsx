// @vitest-environment happy-dom
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Demo from "./Demo";
afterEach(cleanup);
function setup() {
  render(
    <MemoryRouter>
      <Demo />
    </MemoryRouter>,
  );
  return userEvent.setup();
}
describe("interactive incident workflow", () => {
  it("opens evidence at the cited source line", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Telemetry line 3/ }));
    expect(
      screen
        .getByRole("tab", { name: /Evidence/ })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(document.querySelector(".fb-log .highlight")?.textContent).toContain(
      "dds participant discovery timeout",
    );
  });
  it("persists checklist changes in the current demo session", async () => {
    const user = setup();
    const check = screen.getByRole("checkbox", {
      name: "Compare access-point and supervisor logs",
    }) as HTMLInputElement;
    expect(check.checked).toBe(false);
    await user.click(check);
    expect(check.checked).toBe(true);
    expect(screen.getByText("2/2 complete")).toBeTruthy();
  });
  it("adds a handoff note without confusing it with generated analysis", async () => {
    const user = setup();
    await user.click(screen.getByRole("tab", { name: "Discussion" }));
    await user.type(
      screen.getByRole("textbox", { name: "Handoff note" }),
      "Synthetic handoff: mission remains paused.",
    );
    await user.click(screen.getByRole("button", { name: /Add note/ }));
    expect(
      screen.getByText("Synthetic handoff: mission remains paused."),
    ).toBeTruthy();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Handoff note",
        }) as HTMLTextAreaElement
      ).value,
    ).toBe("");
  });
  it("creates an incident from the bounded input form", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /New incident/ }));
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Incident title"),
      "Synthetic motor warning",
    );
    await user.type(within(dialog).getByLabelText("Robot or system"), "AMR-22");
    await user.type(
      within(dialog).getByLabelText("Operator observation"),
      "Stopped while testing synthetic motor telemetry.",
    );
    await user.type(
      within(dialog).getByLabelText("Telemetry excerpt"),
      "12:00 WARN motor current high; mission paused",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /Save incident/ }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Synthetic motor warning",
        level: 2,
      }),
    ).toBeTruthy();
    expect(screen.getByText(/Incident saved/)).toBeTruthy();
  });
  it("filters incidents by robot and has an empty state", async () => {
    const user = setup();
    const search = screen.getByRole("textbox", { name: "Search incidents" });
    await user.type(search, "AMR-12");
    expect(document.querySelectorAll(".fb-incident-card")).toHaveLength(1);
    await user.clear(search);
    await user.type(search, "unknown-robot");
    expect(screen.getByText("No incidents here")).toBeTruthy();
  });
  it("never pretends that an offline review is a real integration", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Review brief/ }));
    expect(screen.getByRole("alert").textContent).toContain(
      "does not simulate a model verdict",
    );
  });
});
