# Portal submission draft — do not submit the placeholders

**Live URL:** Pending successful DeepSpace deployment. Do not use a guessed address.

**Repository:** Pending publication to DeepSpace cloud source. Copy the actual source/repository link after deploy and verify reviewer access.

**Writeup draft:**

FleetBrief is a shared robotics incident workspace built around one complete flow: capture synthetic telemetry, inspect a cited AI triage brief, adopt a human response plan, and hand off context to another operator. The public demo is interactive and clearly labels its example output; the signed-in workspace uses DeepSpace's native authentication and realtime records.

Three integration endpoints serve different purposes: Claude drafts structured findings and unknowns, Jev gives an independent grounding/caution opinion, and Exa retrieves official references. Exa receives only a fixed public topic, never raw telemetry. AI output cannot execute commands, and model-generated analysis records are writable only by the server.

The main tradeoff is a small shared synthetic sandbox rather than a production fleet-control product. I left out live ingestion, autonomous recovery and private organizations to focus on evidence provenance, collaboration and recoverable errors. AI reviews are advisory, not safety certification.

I used a coding agent to propose the scope, implement the application and tests, and prepare documentation. The agent verified TypeScript, lint, 26 offline tests and the isolated demo build. These checks include citation bounds, rejected malformed output, permission configuration, restricted search and interactive incident workflows.

**Before submitting, replace this paragraph with what you personally verified:** native app build, deployed login, all three real provider calls, citation accuracy, two-account synchronization, error recovery, and desktop/mobile usability are pending. Do not state they passed until you have checked them. Record any remaining limitations explicitly.
