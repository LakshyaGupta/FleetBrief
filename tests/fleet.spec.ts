/** Real native-backend checks. Requires a registered app and two CLI test accounts.
 * No provider is called or billed by these collaboration tests. */
import { test, expect, loadAllTestAccounts } from "deepspace/testing";
const count = loadAllTestAccounts().length;
test.skip(
  count < 2,
  "Create/recover two DeepSpace test accounts before running the native collaboration suite.",
);
test("a second signed-in member sees a new incident and a response update", async ({
  users,
}) => {
  const [a, b] = await users(2);
  await Promise.all([a.page.goto("/home"), b.page.goto("/home")]);
  const title = `Synthetic collaboration ${Date.now()}`;
  const create = a.page.getByRole("button", { name: /New incident/ });
  await expect(create).toBeEnabled({ timeout: 20000 });
  await create.click();
  const dialog = a.page.getByRole("dialog");
  await dialog.getByLabel("Incident title").fill(title);
  await dialog.getByLabel("Robot or system").fill("TEST-42");
  await dialog
    .getByLabel("Operator observation")
    .fill("Synthetic robot paused during a reproducible test.");
  await dialog
    .getByLabel("Telemetry excerpt")
    .fill(
      "10:00 INFO robot=TEST-42 state=paused\n10:01 WARN heartbeat_age_ms=6000",
    );
  await dialog.getByRole("button", { name: /Save incident/ }).click();
  await expect(dialog).toBeHidden();
  const card = b.page.locator(".fb-incident-card").filter({ hasText: title });
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.click();
  await expect(
    b.page.getByRole("heading", { name: title, level: 2 }),
  ).toBeVisible();
  await b.page
    .getByRole("textbox", { name: "New response action" })
    .fill("Inspect the synthetic test evidence");
  await b.page.getByRole("button", { name: "Add response action" }).click();
  const aCard = a.page.locator(".fb-incident-card").filter({ hasText: title });
  await aCard.click();
  const action = a.page.getByRole("checkbox", {
    name: "Inspect the synthetic test evidence",
  });
  await expect(action).toBeVisible({ timeout: 10000 });
  await action.check();
  await expect(
    b.page.getByRole("checkbox", {
      name: "Inspect the synthetic test evidence",
    }),
  ).toBeChecked({ timeout: 10000 });
  await b.page
    .getByRole("combobox", { name: "Incident status" })
    .selectOption("resolved");
  await expect(
    a.page.getByRole("combobox", { name: "Incident status" }),
  ).toHaveValue("resolved");
});
