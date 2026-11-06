# Real vs. mocked — RoomWall

Stated plainly.

| Part | Real or mocked | Proof |
|---|---|---|
| Switch calling RoomWall before every human and agent message | Real (Switch 0.31.0, Docker Compose) | Gate 0 log, Gate 1 live log (`docs/evidence/phase3-live-log.txt`) + [demo video](https://youtu.be/CQaR75Unaxs) 0:38 (Switch Trust set to RoomWall) and 1:01–1:25 |
| Blocks shown in chat ("blocked by Switch Trust") | Real — Switch's own notices | `docs/evidence/live-block-town-square.png`, demo video 1:15 |
| The agent (Claude Code, hosted by Switch Console) | Real | Demo video |
| Detectors, wall rule, store | Real code, deterministic, no AI | `npm test` (59 pass, 0 fail) |
| Leak Lab | Real HTTP to the real server, seeded inputs | `npm run lab` (5 BLOCKED, 3 OK) |
| Client names, amounts, emails, phone numbers | Made up for the demo | `lab/scenario.js`, PRD §16 |
| How the agent knows another room's details in the demo | Real agent, real notes file in its shared working folder | Demo video 0:22–0:38 (leak with Switch Trust off), 1:01–1:25 (same request blocked) |

**Fallbacks:** none hidden. If RoomWall is down or slower than 2 s, Switch lets messages through with "could not check" (Switch fails open; PRD §12).

**Not built yet:** paraphrase detection, in-chat allow/link commands (see ROADMAP.md); P1 extras: JSON persistence, `/wall` page, redact mode.

**Live in Switch with RoomWall itself:** verified 2026-11-06 (PRD §14 Gate 1). A real agent reply in client-zenith carrying client-acme's retainer was BLOCKED (`CROSS_ROOM_LEAK`, 0.6 ms). The agent leaked it only when asked directly. A person pasting Acme's amount into client-zenith was also BLOCKED live (`CROSS_ROOM_PASTE`, demo video 1:51). Linked rooms sharing is shown with Lab row C6, not live in Switch.

This file, PRD §17 and the README agree. An honest "not yet" beats a fake green badge.
