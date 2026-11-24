# FleetBrief

A shared robotics incident-triage workspace built for the DeepSpace build exercise.

**Delivery status:** source implementation complete for review; 26 offline tests, TypeScript and lint pass, and the isolated public-demo bundle builds. The app is **not registered or deployed yet** because the owner has not signed in to the DeepSpace CLI. Native backend, multi-user browser behavior, and the three real provider calls remain unverified. Do not submit the proposed URL as though it is live.

## Product flow

1. Explore the public, interactive synthetic demo at `/`.
2. Sign in at `/home` for saved shared work. Load the three synthetic incidents or create one, typing telemetry or loading a small text/log/CSV excerpt.
3. Generate a structured triage brief. Open a finding's line citation to inspect the original telemetry.
4. Request an independent review, then explicitly add proposed steps to the human response plan.
5. Update a checklist or status and leave a handoff note. Other signed-in members receive native record updates.
6. Search official documentation for the selected public topic, or export the incident as Markdown.

Nothing connects to equipment or executes a control command. All examples were invented for this exercise. The offline demo never pretends its canned output was generated live.

## Start locally

Use Node 24 (or another version supported by package.json), npm 11, and an account you own.

```sh
npm ci
npm run type-check
npm run lint
npm run test:offline
```

For the public demo alone, before app registration:

```sh
npm run preview:demo
```

Open **http://127.0.0.1:5174/preview/**. This separate entry does not mount native auth or a backend; do not use it to verify production login. The live-workspace link needs the real app running instead.

```sh
npm run build:demo
```

This verifies a static demo bundle in `preview-dist/`, not the production Worker.

## Register, verify, deploy

From the project folder:

```sh
npx deepspace auth login
npx deepspace auth whoami --json
npx deepspace app init
npm run validate
npm run build
npx deepspace dev start
```

Complete login in your own browser. The CLI mints the actual app ID into `wrangler.toml`; never replace `__APP_ID__` with a made-up value. The normal SDK build and native runtime deliberately refuse an unregistered app. No credentials belong in source control. Keep `.dev.vars`, `.deepspace`, and local token files excluded.

On the local native app, work through `VERIFICATION.md`. Check that Claude, Jev and Exa actually return usable responses under your account, including credits and endpoint availability. Fix any live-provider differences before submission. The offline tests mock providers, so they cannot establish those facts.

DeepSpace cloud source is the default repository, with no GitHub account needed. After registration and verification:

```sh
git init
git add .
git commit -m "Build FleetBrief incident triage workspace"
npx deepspace deploy --json
npx deepspace app source --json
```

Use the **actual successful deploy output** for the live URL. `fleetbrief-lakshya.app.space` is only a proposed name until the platform accepts it. Use the platform's repository/source link for the submission, checking reviewer access. No repository has been published from this checkout yet. Do not paste a local filesystem path or an authenticated URL containing credentials.

The first push/deploy establishes the authoritative source. If you want GitHub to be authoritative instead, set it up deliberately **before** the first DeepSpace push/deploy, following the official source-control docs. There is no reason to introduce an external GitHub dependency for this exercise.

## DeepSpace choices

| Capability | Platform surface | Why it exists |
| --- | --- | --- |
| Auth and member roles | Native AuthGate, AuthOverlay, verified server actions | No custom credentials/session system |
| Shared state | RecordScope, useQuery, confirmed mutations, SQLite-backed RecordRooms | Persistent incidents, status, checklist and handoff collaboration |
| Triage | `anthropic/chat-completion` | Structured hypotheses with numbered evidence and unknowns |
| Review | `cloudflare/jev` | Separate grounding/caution opinion; explicitly not a safety certification |
| References | `exa/search` | Selected-topic search restricted to official documentation domains |

These are three separate integration endpoints. They are implemented and wired to the UI but **not yet verified against live providers**. All are user-billed in `src/integrations.ts`; a signed-in caller needs appropriate DeepSpace credits/access. There are no provider API keys in the client. The third integration is not used to transmit raw logs: the server permits only three fixed public topics, independently of anything the incident author pasted.

## Trust boundary and data model

- This is one **shared evaluation sandbox**, not a private multi-tenant fleet service. Every signed-in member can read incidents and update plans/status. The UI states this before collection. Use synthetic data only.
- `incidents`: bounded text, robot, priority, topic and status. Required fields and text limits exist in the persistence schema as well as form validation.
- `analyses`: server-owned snapshot plus validated structured brief. Browser roles can read but cannot create, update or delete AI output. Actions independently verify app membership because action tools bypass normal record RBAC.
- `plan_steps`: human-authored or explicitly adopted suggested actions and completion state.
- `comments`: shared notes; ordinary members can edit/delete only their own notes.
- Provider output is parsed with Zod; citation numbers must fit the supplied telemetry. This validates structure and bounds, **not the factual truth of a claim**. Original telemetry remains visible. No HTML from the model is rendered.
- The brief retains its input snapshot. A mismatch triggers a stale warning. Status changes do not invalidate the source evidence.
- Failed integration calls show errors and do not insert a placeholder analysis. Human notes and status remain separate. Re-running an analysis creates a new historical record rather than overwriting an existing output.
- Exa results must be HTTPS on an exact allowlist of official domains; arbitrary user search terms are rejected by the server.

## Code map

| File | Responsibility |
| --- | --- |
| `src/fleet/domain.ts` | Zod input/output boundaries, citation bounds, URL filtering, report export |
| `src/fleet/Workspace.tsx` | Queue, evidence/brief/discussion/reference tabs, modal and human plan |
| `src/fleet/Live.tsx` | Native realtime queries, confirmed writes, authenticated action calls |
| `src/fleet/Demo.tsx` | Explicitly offline demo using synthetic fixtures and local React state |
| `src/actions/index.ts` | Authorized, user-billed provider calls and server-owned analysis creation |
| `src/schemas/fleet-schema.ts` | Database columns, bounds and role permissions |
| `tests/fleet.spec.ts` | Real two-account collaboration test, pending native execution |

## Tests and evidence

`npm run test:offline`: **26 passed** across domain, actions, schema, interactive DOM and public SSR tests. Providers and membership lookup are mocked for action tests. UI interaction tests use happy-dom, not a real browser engine. TypeScript and ESLint also passed. `npm run build:demo` produced a static public-demo bundle.

`npm run build` was attempted and correctly refused the missing minted app ID. Live auth/provider tests have not run. A local Chromium launch was attempted but this execution environment denied the required socket; no desktop/mobile screenshot review is claimed.

The scaffold's native smoke/API/collaboration suites remain. `tests/fleet.spec.ts` adds a real create → second-account view → checklist update → synchronized status flow. It skips explicitly unless two usable CLI test accounts exist. Set up or recover accounts using `npx deepspace test accounts --help`, then run `npx deepspace test run e2e`. Do not report skipped native tests as passing.

## Scope and tradeoffs

The useful unit is one incident: capture context, inspect evidence, adopt a response, hand off. I deliberately omitted live robot connections, autonomous recovery, customer uploads, invitations, organization isolation, alert routing and dashboards with fabricated metrics. Native auth and record sync do the infrastructure work. Search is a deliberate button press rather than an automatic data leak. Jev offers a second opinion without pretending to certify safety.

The bounded sandbox reads up to 100 incidents, 200 analyses and 1,000 plans/notes; it is not an unbounded fleet archive. Status/checklist fields use the platform's ordinary shared-record conflict behavior, not a custom transactional workflow. Reference and review results are session-local; incident evidence, generated briefs, plans and notes are persisted. No background ingest, automatic retries of paid AI calls, provider fallback or production tenant quotas are claimed.

Next priorities after verifying the deployed core: private workspace membership, server-side rate limits/usage budgets, per-incident pagination, cancellation/timeout UX, durable review provenance, and integration tests against the deployed Worker. Add these only when the core flow is demonstrably reliable.

## Agent transparency

A coding agent proposed the product scope, implemented the source and tests, checked local types/lint/tests, and prepared documentation. The applicant must personally inspect and run the app before claiming personal verification. `SUBMISSION.md` contains an honest draft and an explicit outstanding-verification section. Be ready to explain membership checks, evidence snapshots, confirmed writes, and why web search receives only public topic names.
