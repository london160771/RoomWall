# PROJECT_STATE — RoomWall

> Where the project actually stands. A progress log, not requirements (those live in `PRD.md`).
> Update at the end of every phase. Only write what was verified. If this file and the repo disagree, the repo wins.

**Last updated:** 2026-11-06 07:30 WAT · **By:** Claude Code (cloud) · **Commit:** see Phase 2 entry in the build log

---

## 1. Right now

- **Active phase:** Phase 3 — Live in Switch (PRD §23), run by Adesope on Windows
- **Status:** Phases 1–2 done (cloud, `npm run verify` green). Phase 3 not verified live.
- **Next step:** Adesope runs the Phase 3 handoff in §8 below. Cloud continues with Phase 4 README work that does not depend on live results.
- **Blocked by:** nothing

## 2. Phase tracker

| Phase (PRD §23) | Where | Status | Verified on | Commit | Review |
|---|---|---|---|---|---|
| 0 — Gate 0 | Local | **Done** | 2026-11-06 | — | — |
| 1 — Core engine | Cloud | **Done** | 2026-11-06 | Phase 1 commit | A |
| 2 — Server + Leak Lab | Cloud | **Done** | 2026-11-06 | Phase 2 commit | — |
| 3 — Live in Switch | Local | Not started | | | B |
| 4 — Docs + submission | Both | Not started | | | C |
| 5 — P1 extras | Cloud | Not started | | | — |

## 3. Last verification

| Check | Command | Result | Date |
|---|---|---|---|
| Tests | `npm test` | 58 pass, 0 fail (exit 0) | 2026-11-06 |
| Leak Lab | `npm run lab` | 5 BLOCKED, 3 OK — 8/8 checks match PRD §16 (exit 0) | 2026-11-06 |
| Verify | `npm run verify` | exit 0 (tests + Lab) | 2026-11-06 |
| Live block in Switch | PRD §19 | stub only (Gate 0) | 2026-11-06 |

## 4. What works (verified)

- **Gate 0 (PRD §14):** Switch 0.31.0 calls the `Gate.js` stub for human and agent messages and obeys BLOCKED. Room ids are stable per room.
- **Local stack:** Docker Compose in `C:\switch-stack` (profiles `collab,gateway`; `FEATURE_FLAGS_ENABLED=agent_management,agent_chats`). Console 0.40.1 connected as server "RoomWall stack" (API `http://localhost:8000`). Mattermost at `http://localhost:8066` (user `user`). Switch Trust endpoint set to `http://host.docker.internal:8787`, policy id `roomwall`.
- **Agent:** `wall-agent` (Claude Code) on this computer, directory `C:\roomwall-agents\wall-agent`; answers in Town Square.

## 5. Real vs mocked right now

See `REAL_VS_MOCKED.md`. Nothing built yet beyond the Gate 0 stub.

## 6. Demo recordings (PRD §20)

| Act | Recorded? | File | Date |
|---|---|---|---|
| Dangerous default | no | | |
| Without RoomWall | no | | |
| With RoomWall | no | | |
| Break it (Lab) | no | | |
| Control returns | no | | |

## 7. Known issues and limitations

- Room `client-acme` was created before the stack restart and is out of sync with Switch. Create demo rooms fresh in Phase 3.
- Mattermost links from Console point to `mattermost:8065` (Docker-internal). Open `http://localhost:8066/...` in the browser instead.
- Switch fails open if RoomWall is down or slower than 2 s (PRD §12).
- Windows: Console's `claude.CMD` launch hangs; fixed by putting `...\npm\node_modules\@anthropic-ai\claude-code\bin` first on the user PATH (PRD D6).

## 8. Handoff notes

- **Read first:** `CLAUDE.md`, PRD sections for the active phase, then this file.
- **Cloud agents:** no Docker/Switch access; live checks are handed to Adesope with exact steps (CLAUDE.md §4).
- **Env vars:** `PORT`, `ROOMS_FILE`; P1: `STORE_FILE`, `MODE`.
- **Don't touch:** `Gate.js`.

## 9. Build log

Newest first.

- **2026-11-06 — Phase 2: Server + Leak Lab (PRD §23, against §10, §12, §16).**
  - Files: `src/app.js` (Express routes, 401/400/404/500 JSON errors), `src/server.js` (`PORT`, `ROOMS_FILE`), `src/request.js` (body/header validation), `src/log.js` (FR-LOG-001 console line), `src/wall.js` (`checkMessages`: a request is recorded only if every message in it is OK), `src/config.js`, `lab/lab.js`, `lab/client.js`, `lab/table.js`, `test/server.test.js`, `package.json` (`lab`, `verify` scripts).
  - Tests: `npm test` → 58 tests, 58 pass, 0 fail, exit 0 (10 new contract tests: §12 shape, BLOCKED shape + INV-4 over HTTP, paste category, 401 ×2, 400 ×9 cases, INV-2 over HTTP, unknown room ids, 404, log format).
  - Lab: `npm run lab` → 5 BLOCKED, 3 OK — 8/8 checks match PRD §16, `LAB PASSED`, exit 0. `npm run verify` exit 0.
  - Smoke: `npm start` with the shipped `rooms.json` answered `/health` and a real Town Square → Off-Topic leak with BLOCKED; log showed both full room ids.
  - Live check: **not verified live.** Steps for Adesope in §8 (Phase 3 handoff).
  - Limits: as Phase 1. Nothing sent to ROADMAP.md.

- **2026-11-06 — Phase 1: Core engine (PRD §23, against §10, §11, §16, §18).**
  - Files: `package.json` (Express 5.1.0 pinned, `npm test`), `package-lock.json`, `.gitignore`, `src/config.js`, `src/text.js`, `src/amounts.js`, `src/contacts.js`, `src/shingles.js`, `src/detectors.js`, `src/rooms.js`, `src/store.js`, `src/wall.js`, `src/wire.js`, `rooms.json` (Gate 0 room ids + `REPLACE-WITH-…` demo placeholders), `lab/rooms.json`, `lab/scenario.js` (PRD §16 data), `test-support/lab-wall.js`, `test/*.test.js` (8 files).
  - Tests: `npm test` → 48 tests, 48 pass, 0 fail, exit 0. Covers FR-DET-001…004, FR-WALL-001…004, FR-CFG-001, INV-1…5 (one or more named tests each), §12 response shape, and the §16 scenario through the wall core.
  - Speed: INV-3 test asserts one check < 100 ms with 1,000 stored items (passes; target, not a live measurement).
  - Lab: not built yet (Phase 2).
  - Live check: none needed for this phase.
  - Limits: reworded facts and amounts with a space before the suffix (`4.5 m`) are not detected; a phone written with separators may absorb a directly following digit group. Nothing sent to ROADMAP.md.

- **2026-11-06** — Docs created (PRD, CLAUDE, PROJECT_STATE, ROADMAP, REAL_VS_MOCKED, README skeleton).
- **2026-11-06** — Gate 0 passed: agent reply "SECRET" blocked live; stub logged `role: assistant … BLOCKED`.
- **2026-11-05** — Switch Compose stack running with gateway; Windows agent launch bug found and worked around.
