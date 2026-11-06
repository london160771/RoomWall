# PROJECT_STATE — RoomWall

> Where the project actually stands. A progress log, not requirements (those live in `PRD.md`).
> Update at the end of every phase. Only write what was verified. If this file and the repo disagree, the repo wins.

**Last updated:** 2026-11-06 06:45 WAT · **By:** Adesope + Claude (chat) · **Commit:** `[none yet]`

---

## 1. Right now

- **Active phase:** Phase 1 — Core engine (PRD §23)
- **Status:** Not started
- **Next step:** Claude Code (cloud) runs Phases 1 → 2 in continuous mode (CLAUDE.md §11), then hands Phase 3 live steps to Adesope.
- **Blocked by:** nothing

## 2. Phase tracker

| Phase (PRD §23) | Where | Status | Verified on | Commit | Review |
|---|---|---|---|---|---|
| 0 — Gate 0 | Local | **Done** | 2026-11-06 | — | — |
| 1 — Core engine | Cloud | Not started | | | A |
| 2 — Server + Leak Lab | Cloud | Not started | | | — |
| 3 — Live in Switch | Local | Not started | | | B |
| 4 — Docs + submission | Both | Not started | | | C |
| 5 — P1 extras | Cloud | Not started | | | — |

## 3. Last verification

| Check | Command | Result | Date |
|---|---|---|---|
| Tests | `npm test` | not run yet | |
| Leak Lab | `npm run lab` | not run yet (expected: 5 BLOCKED, 3 OK) | |
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

- **2026-11-06** — Docs created (PRD, CLAUDE, PROJECT_STATE, ROADMAP, REAL_VS_MOCKED, README skeleton).
- **2026-11-06** — Gate 0 passed: agent reply "SECRET" blocked live; stub logged `role: assistant … BLOCKED`.
- **2026-11-05** — Switch Compose stack running with gateway; Windows agent launch bug found and worked around.
