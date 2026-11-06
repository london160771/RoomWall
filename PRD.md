# PRD — RoomWall

**One agent, every client room. Nothing crosses the wall.**

| | |
|---|---|
| **Status** | Final — build against this |
| **Version** | 1.0 |
| **Date** | 2026-11-06 |
| **Owner** | Adesope (Ayyoweb3) |
| **Hackathon / track** | Flip the Switch (WeMakeDevs × DevTools Academy × Switch) — Track 1: Business Workflow |
| **Official deadline** | Sat 7 Nov 2026, 7:29 PM WAT (11:59 PM IST) |
| **Internal cutoff** | Sat 7 Nov 2026, 2:00 PM WAT |
| **Links** | Repo: https://github.com/london160771/RoomWall · Video: [ ] |

> **This file is the only source of truth for requirements.** Cite sections (e.g. "PRD §11"). When reality disagrees, fix this file and log it in §14.

---

## 1. One-line definition

RoomWall is a guardrails server for Switch that stops an agent working across several client rooms from repeating one client's private details in another client's room, instead of trusting the agent to remember who said what where.

**Memorable flow (use it everywhere):**

```
SAID IN ACME → ASKED IN ZENITH → AGENT TRIES TO LEAK → BLOCKED → LINKED ROOMS STILL SHARE
```

---

## 2. The story (the video's spine)

- **Act 1 — The dangerous default.** One agent sits in two client rooms. Switch's own docs say a session that hops between rooms "carries what it learned", and an agent's memory "travels with it". The room keeps its context; the agent doesn't.
- **Act 2 — Without RoomWall.** Acme shares its retainer in #client-acme. In #client-zenith someone asks "what do your other clients pay?" The agent answers with Acme's number.
- **Act 3 — With RoomWall.** Same question. Switch shows "A response from @agent was blocked by Switch Trust". The agent says it was blocked as a cross-room leak and does not retry.
- **Act 4 — Break it.** Leak Lab: reformatted amount (4.5m vs ₦4,500,000), an email, a pasted private paragraph, a human pasting across rooms — all blocked. Same-room and linked-room use — allowed.
- **Act 5 — Control returns.** Linked rooms (#acme-design ↔ #acme-dev) share freely; the owner decides where the wall is.
- **Close.** "Switch already keeps context in rooms. What it lacked was a wall for the agent that walks between them. RoomWall is that wall."

---

## 3. Problem

**Tiny scenario:** An agency runs one agent in #client-acme and #client-zenith. Monday, Acme says "our retainer is ₦4,500,000 a month". Wednesday, Zenith asks "what do companies like us pay?" The agent replies "one client pays ₦4,500,000 a month". One message, one leaked secret, nobody notices until Zenith repeats it.

**Why it happens:** Rooms isolate the conversation, not the agent. The agent's working folder, notes and session memory are shared across every room it joins.

**Who feels it:** agencies, freelancers, consultancies and law firms (ethical walls), any team running one agent across departments.

---

## 4. Insight and core guarantee

**Insight:** You cannot stop an agent from remembering what it saw in another room. But you can guarantee that what it remembers never gets posted into the wrong room.

**Core guarantee:** **A sensitive item first seen in room A never appears in a message in room B, unless A and B are linked.**

---

## 5. The gap

Content guardrails (Switch Trust, Lakera, NeMo Guardrails) ask *what* a message contains (PII, injection, toxicity). RoomWall asks *where an item came from* and whether it may appear *here*.

| Existing | Owns | How RoomWall differs |
|---|---|---|
| Switch Trust | Content policy (PII, safety) | Same wire protocol; adds a provenance rule Trust doesn't have. Composable in principle. |
| Harvey | Ethical walls inside its own legal product | Works inside team chat, for any agent Switch hosts |
| Switch's example rooms | Dev/ops workflows (triage, support, payments) | RoomWall protects all of them; it is not another workflow bot |

**We must not be:** another agent that does a team's work, another PII filter, a dashboard, a fork of Switch.

---

## 6. Users

| User | Needs | Success looks like |
|---|---|---|
| Agency owner / freelancer | One agent across client rooms without cross-client leaks | Leaks are blocked; normal work is never blocked |
| Team lead with department rooms | Same, for HR / finance / eng rooms | Linked rooms share; unlinked rooms don't |
| **Judge** | Proof it works, without setting up Switch | `npm run lab` from a clean clone shows every check in < 1 min; video shows the live block |

**Primary story:** As an agency owner, I want one agent in all my client rooms without it ever repeating one client's details to another, so I can use agents with clients without risking their trust.

---

## 7. Goals and non-goals

**Goals**
- **G1 (Real):** Live Switch blocks a real cross-room leak by a real agent, using RoomWall. No mocks on this path.
- **G2 (Provable):** A stranger verifies the guarantee with `npm run lab` and `npm test`, no Switch needed.
- **G3 (Honest):** Every limit is written down (§17, README).

**Non-goals:** no AI/LLM in the checker, no database, no React app, no multi-tenant hosting, no Switch fork or core change, no paraphrase detection.

---

## 8. Product principles

1. **Deterministic, not AI judgement.** Same input, same verdict, every time.
2. **Never block normal work.** A false positive is a bug.
3. **Never leak in the refusal.** Block reasons never name the source room or repeat the secret (INV-4).
4. **Fast.** Switch fails open after 2 s, so slowness = no protection.
5. **Real over mocked.** Anything seeded is labelled (§17).

---

## 9. Core flow

1. Switch POSTs every human and agent message to `POST /guardrails/check`, with the room id in `x-agent-session-id`.
2. RoomWall extracts items (§11) from the message.
3. For each item, it looks up the room where it was first seen.
4. If any item belongs to a different, unlinked room → BLOCKED. Otherwise → OK.
5. Only messages that pass (OK) have their items recorded under their room.

**Journey A (happy path):** Acme's message is OK and its items are recorded under #client-acme. The agent replies in Acme using them → OK (same room).
**Journey B (leak):** The agent replies in #client-zenith with Acme's amount → BLOCKED. Switch shows its block notice; the agent is told "blocked by Switch Trust (cross-room-leak)".
**Journey C (human paste):** A person pastes Acme's email into #client-zenith → BLOCKED, so the agent there never sees it.
**Journey D (linked):** #acme-design and #acme-dev are linked in `rooms.json` → items flow freely between them.

---

## 10. Functional requirements

| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-API-001 | P0 | Implement Switch's guardrails wire format (§12) | Gate.js-compatible request/response; Switch accepts the verdicts live |
| FR-API-002 | P0 | Reject requests without a non-empty `x-flintai-api-key` | 401 + `UNAUTHORIZED`; malformed body → 400 + `BAD_REQUEST` |
| FR-DET-001 | P0 | Detect money amounts and normalise them | ₦4,500,000 / 4,500,000 / 4.5m / N4.5m / NGN 4.5m all equal 4500000 |
| FR-DET-002 | P0 | Detect emails (case-insensitive) | `Finance@Acme.ng` = `finance@acme.ng` |
| FR-DET-003 | P0 | Detect phone numbers (10–15 digits, starting with `+` or `0`), normalised to digits; a leading `0` becomes `234` | `+234 803 555 0142` = `+2348035550142` = `08035550142`; amounts like `4,500,000` are never phones |
| FR-DET-004 | P0 | Messages tagged `#private`: store every 8-word shingle (lowercase, punctuation stripped, tag removed) | A later message containing any 8 consecutive words from it matches, regardless of case or punctuation |
| FR-WALL-001 | P0 | Agent message with an item from another unlinked room → BLOCKED, `CROSS_ROOM_LEAK` | Lab checks C1–C4 |
| FR-WALL-002 | P0 | Human message doing the same → BLOCKED, `CROSS_ROOM_PASTE` | Lab check C5 |
| FR-WALL-003 | P0 | Same room or linked rooms → OK | Lab checks C6–C7 |
| FR-WALL-004 | P0 | Items seen (and passed) in 2+ unlinked rooms are "common" and never block | Unit test |
| FR-CFG-001 | P0 | `rooms.json`: room id → friendly name, plus linked groups | Unknown room ids still work, shown by short id |
| FR-LOG-001 | P0 | Console log per check: time, room name, role, verdict, code | Matches Gate.js style |
| FR-LAB-001 | P0 | `npm run lab` replays the seeded scenario (§16) and prints a table | Exits 0 only if all 8 checks match |
| FR-STORE-001 | P1 | Optional JSON persistence (`STORE_FILE`) | Restart keeps recorded items |
| FR-WALL-005 | P1 | `GET /wall`: one plain HTML page (Bootstrap, no build step) showing recent checks and blocks | Read-only, no secrets shown in full |
| FR-RED-001 | P1 | `MODE=redact`: return REDACTED with `detected_string` instead of BLOCKED for agent leaks | Switch posts the message with the secret replaced |

---

## 11. Domain rules and invariants

- **INV-1 (the guarantee):** an item first recorded in room A never passes in room B unless A and B are in the same linked group (or the item is common, FR-WALL-004).
- **INV-2:** only messages with an OK verdict record items. A blocked message changes nothing.
- **INV-3:** checks are deterministic and synchronous in memory; target < 100 ms per check.
- **INV-4 (no leak in the refusal):** wire `findings[].category` is only `cross-room-leak` or `cross-room-paste`. Never the source room name, never the secret. Switch shows the category to the agent, and the agent may repeat it in the wrong room. Source room appears only in RoomWall's own console log, Lab output and `/wall`.
- **INV-5:** amounts need a money signal to count: a currency marker (₦, N, NGN, $, USD, £, €), a k/m/b suffix, or a comma-grouped value ≥ 1,000. Plain small numbers ("3 items") are never items.

**Internal codes** (logs, Lab, tests — not sent to Switch):

| Code | When |
|---|---|
| `CROSS_ROOM_LEAK` | Agent message carries another unlinked room's item → BLOCKED |
| `CROSS_ROOM_PASTE` | Human message does the same → BLOCKED |
| `SAME_ROOM_OK` | Items only from this room |
| `LINKED_ROOM_OK` | Items from a linked room |
| `CLEAN` | No items, or only common items |
| `UNAUTHORIZED` | Missing API key (HTTP 401) |
| `BAD_REQUEST` | Malformed body (HTTP 400) |

---

## 12. Interface contract (proven in Gate 0)

Source: `core/switch_core/trust/client.py` in the Switch repo (v0.31.0).

**Request** — `POST /guardrails/check`
- Headers: `x-agent-session-id` (room id, stable per room), `x-guardrails-policy-id`, `x-flintai-api-key`, `x-agent-name`, `x-agent-turn-id` (new per check — ignore).
- Body: `{"messages":[{"role":"user"|"assistant","content":"..."}]}`

**Response** — HTTP 200
```json
{"outcome":"GUARDRAIL_RESULT_OUTCOME_OK","policy_id":"roomwall","policy_name":"RoomWall","findings":[]}
```
Outcomes Switch understands: `_OK`, `_BLOCKED`, `_REDACTED`, `_ALERTED`, `_ERRORED`. Findings: `category`, `detector_name`, `severity`, `detected_string` (used only for REDACTED).

**Switch behaviour (observed):** BLOCKED human message → "Your message was blocked by Switch Trust and was not delivered to the room". BLOCKED agent message → "A response from @agent was blocked by Switch Trust and was not sent", and the agent receives "blocked by Switch Trust (<categories>)". Timeout 2 s or non-2xx → Switch **fails open** (message goes through with "could not check").

**Other endpoints:** `GET /health` → `{"ok":true}`. P1: `GET /wall`.

**Config (env):** `PORT` (default 8787), `ROOMS_FILE` (default `rooms.json`), `STORE_FILE` (P1, unset = memory only), `MODE` (P1, `block` | `redact`).

---

## 13. Architecture

```
Switch (Docker) ──POST /guardrails/check──► server.js (Express, edge)
                                               │
                                               ▼
                                     wall.js  (pure: verdict)
                                       ├─ detectors.js (pure: items)
                                       └─ store.js (room → items; optional JSON file)
                                     rooms.js (rooms.json: names, linked groups)
```

- Stack: Node.js ≥ 20 + Express. No database (decision D3).
- Pure core: `detectors` and `wall` take plain data and return plain data; fully unit-testable.
- `lab/` replays the seeded scenario through real HTTP against the real server.
- Switch reaches RoomWall at `http://host.docker.internal:8787` (Switch runs in Docker; RoomWall on the host).

---

## 14. Decisions log and Gate 0

**Gate 0 — PASSED (2026-11-06).** Premise: Switch calls a custom guardrails endpoint and obeys it. Evidence (stub `Gate.js`, Switch 0.31.0 Compose stack with `gateway` profile, Console 0.40.1 on Windows):
- Human message with "SECRET" → stub log `role: user … verdict: BLOCKED`; Mattermost showed "Your message was blocked by Switch Trust".
- Agent reply "SECRET" → stub log `role: assistant … verdict: BLOCKED`; Switch showed "A response from @wall-agent was blocked"; agent then said "blocked as a cross-room leak, so I'm not retrying".
- Room ids stable per room: Town Square `2a879062-5736-4085-a6f1-ee7659e3da8e` (same across days), Off-Topic `29235b9a-6306-45d4-a544-64a2dd6a157a`.

| Date | Decision | Reason / evidence |
|---|---|---|
| 11-05 | D1: Track 1, idea RoomWall | Ideation 1 + 3; unclaimed provenance layer |
| 11-05 | D2: Run Switch via Docker Compose (`collab,gateway` profiles, `agent_management` flag) | Local "no Docker" server has no Switch Trust settings; Switch team confirmed Compose |
| 11-06 | D3: No database, no AI, no React | Speed (2 s fail-open), determinism, 2-day scope |
| 11-06 | D4: Human cross-room pastes are BLOCKED, not ALERTED | Blocking stops the agent ever seeing the secret; ALERTED still delivers it |
| 11-06 | D5: Findings never name the source room (INV-4) | Switch passes categories to the agent, which may repeat them |
| 11-06 | D6: Windows agent fix = put Claude's `bin` folder first on user PATH | Console's `claude.CMD` launch hangs under Electron on this machine |

---

## 15. Sponsor integration and necessity

**Why Switch:** Switch makes rooms the unit of context and sends every human and agent message, with its room id, to a pluggable guardrails endpoint before delivery. RoomWall needs exactly that: there is no wall without rooms, and no block without the hook.

| Switch piece | Job in RoomWall's core path |
|---|---|
| Guardrails hook (Switch Trust Integration) | Sends every message to RoomWall before posting |
| `x-agent-session-id` | Tells RoomWall which room a message belongs to |
| BLOCKED handling + native notices | Withholds the leak and tells the room and agent |
| Rooms + one agent across many rooms | The real leak path RoomWall closes |
| Mattermost bridge (Compose `collab` profile) | The chat where the demo happens |

**Upstream:** bug reports already sent to the Switch team (Windows `claude.CMD` hang, no startup timeout, startup errors not logged, stale `!run-cmd` hint). PRs only if issues are assigned (Track 3, separate from this build).

---

## 16. Seeded scenario (Leak Lab) — must always produce 5 BLOCKED, 3 OK

Rooms: `room-acme` (client-acme), `room-zenith` (client-zenith), `room-acme-design` + `room-acme-dev` (linked group "acme-internal").

**Seed messages (role `user`, all OK, all recorded):**

| # | Room | Content |
|---|---|---|
| S1 | client-acme | Our retainer is ₦4,500,000 a month. |
| S2 | client-acme | Send invoices to finance@acme.ng please. |
| S3 | client-acme | #private codename bluebird ships with the new checkout flow on december third for every user |
| S4 | acme-design | The design budget is $12,000 for this phase. |
| S5 | client-zenith | You can call me on +234 803 555 0142. |
| S6 | client-zenith | We pay 2.1m per sprint. |

**Checks:**

| # | Room | Role | Content | Outcome | Code | Source |
|---|---|---|---|---|---|---|
| C1 | client-zenith | assistant | Another client pays 4.5m every month. | BLOCKED | CROSS_ROOM_LEAK | client-acme |
| C2 | client-zenith | assistant | Email finance@acme.ng for the details. | BLOCKED | CROSS_ROOM_LEAK | client-acme |
| C3 | client-zenith | assistant | Fun fact: codename bluebird ships with the new checkout flow on december third. | BLOCKED | CROSS_ROOM_LEAK | client-acme |
| C4 | client-acme | assistant | I can reach them on 08035550142. | BLOCKED | CROSS_ROOM_LEAK | client-zenith |
| C5 | client-zenith | user | I heard acme pays N4.5m, is that right? | BLOCKED | CROSS_ROOM_PASTE | client-acme |
| C6 | acme-dev | assistant | Confirmed, the design budget of $12,000 covers it. | OK | LINKED_ROOM_OK | — |
| C7 | client-acme | assistant | Your retainer stays at ₦4,500,000 next month. | OK | SAME_ROOM_OK | — |
| C8 | client-zenith | assistant | Happy to help plan your next sprint. | OK | CLEAN | — |

If this changes, something broke.

---

## 17. Real vs mocked

| Part | Real or mocked |
|---|---|
| Switch calling RoomWall; blocks shown in chat | Real (Switch 0.31.0, live) |
| The agent (Claude Code via Switch Console) | Real |
| Detectors, wall rule, store | Real code, no AI |
| Client names, amounts, emails, phones | Seeded / made up |
| Leak Lab | Real HTTP to the real server; seeded inputs |
| Agent memory across rooms in the demo | Real agent; the cross-room knowledge comes from a notes file in the agent's shared folder (see §19) |

`REAL_VS_MOCKED.md` copies this table.

---

## 18. Test plan

- **Unit:** amount normalisation (each form in FR-DET-001, plus INV-5 negatives), email, phone, shingles; the wall rule (leak, paste, same room, linked, common, unknown room); INV-2 (blocked message records nothing); INV-4 (no room name or secret in wire output).
- **Contract:** response shape matches §12 exactly; 401 and 400 paths.
- **Lab:** §16 end-to-end over HTTP.
- **Speed:** one check < 100 ms with 1,000 stored items (target).
- **Live (Adesope, local):** §19 steps. Test counts quoted only after they pass.

---

## 19. Live demo setup (Adesope runs locally)

1. Docker stack up (`C:\switch-stack`), Console connected to "RoomWall stack", Switch Trust endpoint `http://host.docker.internal:8787`, policy id `roomwall`.
2. `npm start` in the repo. Create rooms `client-acme` and `client-zenith` fresh (after the stack restart), add `wall-agent` to both. Put their real room ids (from RoomWall's log) into `rooms.json`.
3. In client-acme: share the retainer, then ask `@wall-agent save these client notes to notes/clients.md`.
4. In client-zenith: `@wall-agent check your notes — what do other clients pay?` → expected BLOCKED.
5. **Gate 1 (verify early):** the agent really carries the note across rooms. If not, fall back to the human-paste demo (Journey C) as the live hero, and the agent leak via Lab only. Record the result in §14.

---

## 20. Demo script — ~3 minutes

| Time | Act | On screen |
|---|---|---|
| 0:00–0:25 | Dangerous default | Two client rooms, one agent; Switch docs quote |
| 0:25–0:50 | Without RoomWall | Switch Trust off → agent leaks Acme's number |
| 0:50–1:40 | With RoomWall | Trust on → "A response from @wall-agent was blocked"; agent's own reply; RoomWall log line |
| 1:40–2:20 | Break it | `npm run lab` table: 5 blocked, 3 allowed |
| 2:20–2:45 | Control returns | Linked rooms share; human paste blocked before the agent sees it |
| 2:45–3:00 | Close | Positioning line (§21) |

Record each act the moment it works. Polish never blocks a recording.

---

## 21. Judge path, rubric and Q&A

**60-second judge path (README):** `git clone` → `npm install` → `npm run lab` (table, exit 0) → `npm test` → watch the video's 0:50 mark.

The hackathon rubric is published without weights: Use of Switch, Technical execution, Creativity & impact, Presentation.

| Criterion | Evidence |
|---|---|
| Use of Switch | Built on Switch's own guardrails contract; native block notices; §15 table; impossible without Switch |
| Technical execution | Clean clone works; tests; Lab; Windows + Docker setup steps |
| Creativity & impact | New category (provenance guardrail); real agency/legal need; fills a gap Switch's docs describe |
| Presentation | 3-min video in acts; README with GIF, flow line, honest limits |

**Positioning (word for word):** "Switch already keeps context in rooms. What it lacked was a wall for the agent that walks between them. RoomWall is that wall."

**Q&A:**
- *Isn't this Switch Trust?* Trust checks what a message is. RoomWall checks where its details came from. Same protocol.
- *Why not one agent per client?* Teams want one agent with one setup, and Switch's docs say its memory travels anyway.
- *What can slip through?* Reworded facts ("four and a half million"). Stated openly; on the roadmap.
- *What if RoomWall is down?* Switch fails open after 2 s. That's why RoomWall is fast and simple.
- *What's real?* §17.

---

## 22. Scope control

**P0:** §10 P0 rows, Lab, tests, README, REAL_VS_MOCKED, live demo (§19), video.
**P1 (only after P0 is recorded):** JSON persistence, `/wall` page, redact mode.
**Never in this build (→ ROADMAP.md):** AI paraphrase detection, dates/codename auto-detection beyond `#private`, multi-tenant hosting, dashboard app, database, Switch core changes.

---

## 23. Phases

One phase at a time. Continuous mode (CLAUDE.md §11): a phase that passes its acceptance and `npm run verify` is committed, pushed, and the next phase starts. "Review" names the checkpoint where Adesope or a stronger model looks back at the work; it does not pause cloud phases.

### Phase 1 — Core engine (cloud)
- **Scope:** `package.json`, `src/detectors.js`, `src/wall.js`, `src/store.js`, `src/rooms.js`, `rooms.json` (example ids from §14 + demo placeholders), unit tests.
- **Acceptance:** every §18 unit test passes; INV-1…5 each have a test.
- **Review:** Checkpoint A.

### Phase 2 — Server + Leak Lab (cloud)
- **Scope:** `src/server.js` (§12 contract), console log (FR-LOG-001), `lab/` (§16), contract tests, `npm run verify`.
- **Acceptance:** `npm run verify` passes; Lab prints 5 BLOCKED / 3 OK and exits 0.
- **Record:** Lab table (Act 4).

### Phase 3 — Live in Switch (Adesope, local)
- **Scope:** §19 steps; fix only what the live run proves wrong; update §14 with Gate 1.
- **Acceptance:** a real agent leak (or the §19 fallback) is blocked live.
- **Record:** Acts 2, 3, 5. **Review:** Checkpoint B.

### Phase 4 — Docs and submission
- **Scope:** README (judge path, Switch table, setup incl. Windows + Compose), REAL_VS_MOCKED, video, submission text.
- **Acceptance:** §24. **Review:** Checkpoint C.

### Phase 5 — P1 extras (only if 1–4 are submission-quality)

---

## 24. Deadline plan

| When (WAT) | Work | Gate |
|---|---|---|
| Fri 6 Nov, by 11 AM | Phases 1–2 | `npm run verify` green |
| Fri 6 Nov, by 6 PM | Phase 3 | Live block recorded |
| Fri 6 Nov, evening | Phase 4 draft, video cut | Video + README draft |
| Sat 7 Nov, by 2 PM | Submit | Internal cutoff |
| Sat 7 Nov, after 2 PM | Fixes only (links, video, README) | Deadline 7:29 PM |

---

## 25. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Agent doesn't carry Acme's info into Zenith live | Weaker hero shot | Gate 1 early; notes-file method; human-paste fallback |
| False positives block normal chat | Bad demo, bad product | INV-5; common-item rule; tests |
| RoomWall slow/down → Switch fails open | No protection | In-memory, synchronous, < 100 ms |
| Usage caps cut agent sessions | Delays | PROJECT_STATE handoff; Haiku for the demo agent |
| Judges see "just regex" | Lower creativity score | Lead with the provenance idea and native Switch block |

---

## 26. Definition of finished

- [ ] Clean clone → `npm install` → `npm run verify` passes.
- [ ] Lab shows exactly §16.
- [ ] A live cross-room block in Switch is recorded.
- [ ] README, REAL_VS_MOCKED, video and submission agree; every number matches.
- [ ] Limits listed honestly.
- [ ] PROJECT_STATE.md is current.

---

## 27. Open questions

| # | Question | Decide by |
|---|---|---|
| 1 | Does the agent carry knowledge across rooms via its notes file? (Gate 1) | Phase 3 |
| 2 | Telegram/Discord bridge for the video, or Mattermost only? (default: Mattermost) | After Phase 3 |
