# ROADMAP — RoomWall

> The parking lot. Any idea outside PRD scope goes here, never into the build. Nothing here is built until it moves into `PRD.md` (§22 scope + §23 phases) with Adesope's approval.

## 1. How to use this file

- **Agents:** when an idea comes up mid-phase, add one row to §2 and mention it in the phase report. Don't build it.
- **Adesope:** review after submission. Promote an idea by adding it to the PRD, then delete its row here.

## 2. Parked ideas

| Date | Idea | Why it came up | Why parked | Value later |
|---|---|---|---|---|
| 2026-11-06 | Paraphrase detection ("four and a half million") with a local model | Main known gap | Breaks determinism and the < 100 ms target | H |
| 2026-11-06 | Detect dates and codenames without `#private` | Launch dates are sensitive too | False positives; needs tuning | M |
| 2026-11-06 | Per-room allow-list ("this amount is public") from chat, e.g. `!wall allow 4.5m` | Owner control from inside the room | Needs a command channel; P0 uses `rooms.json` | M |
| 2026-11-06 | Compose RoomWall in front of real Switch Trust (chain both checks) | Keep Trust's PII rules plus RoomWall's provenance rule | Needs Trust access | H |

## 3. After the hackathon

**Next:**
1. Paraphrase-aware matching, kept optional.
2. In-chat allow / link commands.
3. Package as a Docker service next to the Switch Compose stack.

**Later:** shared store for multiple RoomWall instances; audit export per room.

**Probably never:** a full dashboard app — the chat and Switch's own notices are the interface.

## 4. Future story

- **Who needs this next:** any team that runs one agent across clients or departments on Switch — agencies, consultancies, law firms.
- **Upstream:** offer RoomWall to the Switch team as a reference guardrails endpoint and an example of a custom policy.
- **Line for judges:** "Today it walls off client rooms. Next it lets each room decide, from the chat, what may cross."

Keep consistent with PRD §21–22.
