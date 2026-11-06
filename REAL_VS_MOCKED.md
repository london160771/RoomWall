# Real vs. mocked — RoomWall

Stated plainly.

| Part | Real or mocked | Proof |
|---|---|---|
| Switch calling RoomWall before every human and agent message | Real (Switch 0.31.0, Docker Compose) | Gate 0 log + demo video [link] |
| Blocks shown in chat ("blocked by Switch Trust") | Real — Switch's own notices | Demo video [timestamp] |
| The agent (Claude Code, hosted by Switch Console) | Real | Demo video |
| Detectors, wall rule, store | Real code, deterministic, no AI | `npm test` |
| Leak Lab | Real HTTP to the real server, seeded inputs | `npm run lab` |
| Client names, amounts, emails, phone numbers | Made up for the demo | `lab/` seed data, PRD §16 |
| How the agent knows another room's details in the demo | Real agent, real notes file in its shared working folder | Demo video [timestamp] |

**Fallbacks:** none hidden. If RoomWall is down or slower than 2 s, Switch lets messages through with "could not check" (Switch fails open; PRD §12).

**Not built yet:** paraphrase detection, in-chat allow/link commands (see ROADMAP.md).

This file, PRD §17 and the README agree. An honest "not yet" beats a fake green badge.
