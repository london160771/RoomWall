# Real vs. mocked — RoomWall

Stated plainly.

| Part | Real or mocked | Proof |
|---|---|---|
| Switch calling RoomWall before every human and agent message | Real (Switch 0.31.0, Docker Compose) | Gate 0 log + demo video [PLACEHOLDER: video link] |
| Blocks shown in chat ("blocked by Switch Trust") | Real — Switch's own notices | Demo video [PLACEHOLDER: timestamp] |
| The agent (Claude Code, hosted by Switch Console) | Real | Demo video |
| Detectors, wall rule, store | Real code, deterministic, no AI | `npm test` (59 pass, 0 fail) |
| Leak Lab | Real HTTP to the real server, seeded inputs | `npm run lab` (5 BLOCKED, 3 OK) |
| Client names, amounts, emails, phone numbers | Made up for the demo | `lab/scenario.js`, PRD §16 |
| How the agent knows another room's details in the demo | Real agent, real notes file in its shared working folder | Demo video [PLACEHOLDER: timestamp] |

**Fallbacks:** none hidden. If RoomWall is down or slower than 2 s, Switch lets messages through with "could not check" (Switch fails open; PRD §12).

**Not built yet:** paraphrase detection, in-chat allow/link commands (see ROADMAP.md); P1 extras: JSON persistence, `/wall` page, redact mode.

**Live in Switch with RoomWall itself:** not verified live yet [PLACEHOLDER: Phase 3 result]. Gate 0 proved the hook with a stub.

This file, PRD §17 and the README agree. An honest "not yet" beats a fake green badge.
