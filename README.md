# RoomWall

**One agent, every client room. Nothing crosses the wall.**

RoomWall is a guardrails server for [Switch](https://github.com/sandbox-quantum/switch) that stops an agent working across several client rooms from repeating one client's private details in another client's room.

**Demo video:** `[PLACEHOLDER: video link — added after recording]` · Built for Flip the Switch (Track 1: Business Workflow)

```
SAID IN ACME → ASKED IN ZENITH → AGENT TRIES TO LEAK → BLOCKED → LINKED ROOMS STILL SHARE
```

## The problem

An agency runs one agent in #client-acme and #client-zenith. Acme says "our retainer is ₦4,500,000 a month". Days later, Zenith asks "what do companies like us pay?" and the agent answers with Acme's number.

Switch keeps the conversation in each room, but the agent's working folder, notes and session memory travel with it. One message leaks one secret, and nobody notices until Zenith repeats it.

## What it does

**Guarantee:** a sensitive item first seen in room A never appears in a message in room B, unless A and B are linked.

- Plugs into Switch's own guardrails hook. No fork, no core change.
- Remembers which room each sensitive item first came from: money amounts, emails, phone numbers, and any 8-word run of text from a message tagged `#private`.
- Blocks that item in every other unlinked room, whether an agent writes it (`cross-room-leak`) or a person pastes it (`cross-room-paste`). A blocked human paste never reaches the agent in that room.
- Lets linked rooms (for example #acme-design and #acme-dev) share freely.
- Deterministic, with no AI and no database. A check is in-memory and synchronous.
- The block reason never names the source room or repeats the secret. Switch shows the category to the agent, and the agent might repeat it.

## Judge path (60 seconds)

No Switch needed. Node.js 20 or later.

```bash
git clone https://github.com/london160771/RoomWall
cd RoomWall
npm install
npm run lab
npm test
```

`npm run lab` starts the real server, replays the seeded scenario from PRD §16 over real HTTP, and exits 0 only if all 8 checks match. Real output:

```
RoomWall Leak Lab — 6 seed messages, 8 checks over HTTP

#   Room           Role       Content                                       Expected                  Got      Code              Source         Match
--  -------------  ---------  --------------------------------------------  ------------------------  -------  ----------------  -------------  -----
C1  client-zenith  assistant  Another client pays 4.5m every month.         BLOCKED CROSS_ROOM_LEAK   BLOCKED  CROSS_ROOM_LEAK   client-acme    yes
C2  client-zenith  assistant  Email finance@acme.ng for the details.        BLOCKED CROSS_ROOM_LEAK   BLOCKED  CROSS_ROOM_LEAK   client-acme    yes
C3  client-zenith  assistant  Fun fact: codename bluebird ships with the …  BLOCKED CROSS_ROOM_LEAK   BLOCKED  CROSS_ROOM_LEAK   client-acme    yes
C4  client-acme    assistant  I can reach them on 08035550142.              BLOCKED CROSS_ROOM_LEAK   BLOCKED  CROSS_ROOM_LEAK   client-zenith  yes
C5  client-zenith  user       I heard acme pays N4.5m, is that right?       BLOCKED CROSS_ROOM_PASTE  BLOCKED  CROSS_ROOM_PASTE  client-acme    yes
C6  acme-dev       assistant  Confirmed, the design budget of $12,000 cov…  OK LINKED_ROOM_OK         OK       LINKED_ROOM_OK    —              yes
C7  client-acme    assistant  Your retainer stays at ₦4,500,000 next mont…  OK SAME_ROOM_OK           OK       SAME_ROOM_OK      —              yes
C8  client-zenith  assistant  Happy to help plan your next sprint.          OK CLEAN                  OK       CLEAN             —              yes

5 BLOCKED, 3 OK — 8/8 checks match PRD §16
LAB PASSED
```

`npm test` runs 59 tests (unit plus HTTP contract) with `node:test`: 59 pass, 0 fail. They cover each detector, the wall rule, every invariant (INV-1 to INV-5), and the Switch wire contract. `npm run verify` runs both.

**Live result in Switch (2026-11-06, Switch 0.31.0, real Claude Code agent):** the agent was asked in #client-zenith to post the retainer it had saved from #client-acme. Switch showed "A response from @wall-agent was blocked by Switch Trust and was not sent". RoomWall logged:

```
room: client-zenith (2a879062-5736-4085-a6f1-ee7659e3da8e) | role: assistant
verdict: BLOCKED | code: CROSS_ROOM_LEAK | source: client-acme | items: amount | 0.6 ms
```

The agent then replied that it was blocked as a cross-room leak and would not retry. Screenshot: [docs/evidence/live-block-town-square.png](docs/evidence/live-block-town-square.png). Full log: [docs/evidence/phase3-live-log.txt](docs/evidence/phase3-live-log.txt). The agent did not volunteer the number unprompted. It leaked it only when asked directly, and that request was blocked.

## How it uses Switch

| Switch piece | Job in RoomWall |
|---|---|
| Guardrails hook (Switch Trust Integration) | Sends every human and agent message to `POST /guardrails/check` before delivery |
| `x-agent-session-id` header | Tells RoomWall which room the message belongs to |
| BLOCKED outcome and Switch's native notices | Withholds the leak and tells the room and the agent ("blocked by Switch Trust") |
| Rooms, with one agent across many rooms | The real leak path that RoomWall closes |
| Mattermost bridge (Compose `collab` profile) | The chat where the demo happens |

Without rooms there is no wall, and without the hook there is no block.

## Plug into Switch

These steps match the stack used for Gate 0 (Switch 0.31.0, Console 0.40.1, Windows + Docker Desktop).

1. Run Switch with Docker Compose using the `collab` and `gateway` profiles, with `FEATURE_FLAGS_ENABLED=agent_management,agent_chats` set for the stack. For example: `docker compose --profile collab --profile gateway up -d`.
2. On the host, start RoomWall: `npm install` then `npm start`. It listens on port 8787.
3. In Switch Console, open **Switch Trust Integration** and set:
   - endpoint: `http://host.docker.internal:8787` (Switch runs in Docker, RoomWall on the host)
   - policy id: `roomwall`
   - API key: any non-empty value (RoomWall requires one but does not check its value)
4. Post once in each room. The RoomWall log prints each room's full id: `room: 2a879062 (2a879062-5736-4085-a6f1-ee7659e3da8e) | role: user`.
5. Name your rooms and link the ones that may share in `rooms.json`, then restart RoomWall:

```json
{
  "rooms": { "<acme room id>": "client-acme", "<zenith room id>": "client-zenith" },
  "linked": { "acme-internal": ["<acme-design room id>", "<acme-dev room id>"] }
}
```

Rooms that are not in `rooms.json` still work. They are walled off from every other room and shown by short id.

Step-by-step Windows PowerShell instructions, with the output that proves each step, are in [PROJECT_STATE.md](PROJECT_STATE.md) (Phase 3 handoff).

## Configuration

| Env var | Default | Meaning |
|---|---|---|
| `PORT` | `8787` | HTTP port |
| `ROOMS_FILE` | `rooms.json` | Room names and linked groups |

## How it works

```
Switch (Docker) ──POST /guardrails/check──► src/app.js (Express)
                                              │
                                              ▼
                                   src/wall.js  (verdict)
                                     ├─ src/detectors.js (amounts, emails, phones, #private shingles)
                                     └─ src/store.js     (item → rooms it passed in)
                                   src/rooms.js (rooms.json: names, linked groups)
```

1. Switch posts `{"messages":[{"role":"user"|"assistant","content":"..."}]}` with the room id in `x-agent-session-id`.
2. RoomWall strips markdown and extracts items. `₦4,500,000`, `4,500,000`, `4.5m`, `N4.5m` and `NGN 4.5m` all become one amount. `+234 803 555 0142` and `08035550142` become one phone.
3. If any item was first recorded in a different, unlinked room, the message is BLOCKED. Otherwise it is OK.
4. Only OK messages record their items. A blocked message changes nothing.

Response, exactly as Switch expects:

```json
{"outcome":"GUARDRAIL_RESULT_OUTCOME_BLOCKED","policy_id":"roomwall","policy_name":"RoomWall",
 "findings":[{"category":"cross-room-leak","detector_name":"roomwall","severity":"high"}]}
```

Other endpoints: `GET /health` returns `{"ok":true}`. A missing `x-flintai-api-key` gets 401 `UNAUTHORIZED`, and a malformed body gets 400 `BAD_REQUEST`.

## Known limits

- Reworded facts slip through: "four and a half million" or "about 4.5 m" (with a space) are not matched. On the roadmap.
- Only amounts, emails, phones and `#private` text are tracked. Names, dates and codenames without `#private` are not.
- An amount needs a money signal (currency marker, k/m/b suffix, or a comma-grouped value of 1,000 or more). A bare `4500000` is ignored by design, so that ordinary numbers never block.
- Phone numbers must start with `+` or `0`. A leading `0` is read as a Nigerian number (`234`).
- Memory only: restarting RoomWall forgets every recorded item.
- If RoomWall is down or slower than 2 seconds, Switch lets messages through with "could not check" (Switch fails open).
- The first room to mention an item owns it. If two unrelated clients really share a detail, the second one is blocked from saying it until the rooms are linked.
- The < 100 ms per check figure is a target, checked by a unit test with 1,000 stored items, not measured live.

## What's real

See [REAL_VS_MOCKED.md](REAL_VS_MOCKED.md). In short: the detectors, wall rule and Lab are real code; the client names, amounts, emails and phones are made up.

## Project docs

[PRD.md](PRD.md) (requirements) · [PROJECT_STATE.md](PROJECT_STATE.md) (progress) · [ROADMAP.md](ROADMAP.md) (parked ideas) · [CLAUDE.md](CLAUDE.md) (agent rules) · `Gate.js` (Gate 0 stub)
