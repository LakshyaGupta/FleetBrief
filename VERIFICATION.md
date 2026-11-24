# FleetBrief: before submission

Deadline from the supplied portal: **Monday November 23, 2026 at 11:59 PM Eastern / 10:59 PM Central**.

## What the agent has verified

- [x] TypeScript compiles the source with `tsc --noEmit`.
- [x] The Rules of Hooks lint passes.
- [x] All 26 offline tests pass.
- [x] The isolated demo bundle builds, including its JS and responsive CSS.
- [x] Server actions reject non-member roles before reading or billing integrations (mocked).
- [x] Invalid AI output/citation bounds are rejected without saving output (mocked).
- [x] Fixed topic search excludes raw telemetry and filters unsafe result domains (mocked).
- [x] DOM interactions cover creation, citation navigation, checklist state, handoff notes, filtering and transparent offline review.

These checks do not prove live deployment, model quality, real database permissions or browser layout. The native production build is blocked by missing owner login/app registration. The browser runtime in this environment denied sockets.

## Applicant verification — complete these yourself

1. Sign in to the CLI, register with `npx deepspace app init`, then run `npm run validate` and `npm run build`. Fix failures before moving on.
2. Run `npx deepspace dev start` and open its local URL in a real browser. Use the public demo: follow a line citation and inspect the original evidence. Test a narrow mobile viewport as well as desktop. Check keyboard navigation and dialog Escape/focus behavior.
3. Open `/home`. Sign in through the native overlay. Load the synthetic examples. Create an incident and refresh: confirm the saved data remains.
4. Generate a real Claude brief. Verify each claimed observation against the source line yourself. It must distinguish a hypothesis from an established root cause. Confirm no commands execute.
5. Request a real Jev review. Verify it is labeled as a model opinion and that unexpected/provider-error responses remain recoverable.
6. Open References and request a real Exa search. Confirm results use approved HTTPS documentation URLs. Inspect the action request/code to confirm only a fixed public topic is sent upstream, not the pasted telemetry.
7. Add an AI suggestion to the human plan, mark it complete, change status, and leave a note. Export Markdown and compare its checklist/evidence with the screen.
8. Use a second account/browser profile. Confirm it sees the same incident and observes a checklist/status update without refreshing. All signed-in members share the sandbox; no tenant isolation is claimed.
9. Check a signed-out browser cannot read the saved incidents or call a paid server action. Check a member cannot insert/update analysis rows directly through the native records interface. Keep data synthetic during tests.
10. Test an integration failure (for example a simulated failed request in devtools). There must be an understandable error, no fake analysis, and a usable manual plan. Retry after recovery.
11. Commit the registered, tested source and deploy. Open the actual `.app.space` URL in a fresh browser and repeat the important path. Verify the repository link is accessible to reviewers and contains the deployed code.
12. Replace the pending fields in `SUBMISSION.md` with observed facts. Describe only the work you actually verified yourself. Paste the actual URL, repository and writeup into the portal, then submit.

## Live session preparation

Be able to locate and explain these four decisions without reading a script:

- Why every paid server action checks membership even though the client already requires login.
- How an AI line citation points to original evidence, and why a valid line number is not proof a claim is correct.
- Why Exa receives a fixed category while Claude/Jev receive the incident context.
- Why confirmed native writes are used before closing the creation modal, and which state is persisted versus session-local.

Practice a small edit yourself: add an incident status, update its schema/UI, add a test, and explain the compatibility implications. Do not submit that practice change unless it improves the core product.
