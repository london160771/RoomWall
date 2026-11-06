# CLAUDE.md — RoomWall

> Working rules for every agent. Requirements live in `PRD.md`; this file points to it and never copies it.
> Codex reads AGENTS.md by default, so start Codex prompts with "Read CLAUDE.md and PRD.md first."

## 1. What this is

**RoomWall** — a guardrails server for Switch that stops an agent working across several client rooms from repeating one client's private details in another client's room.
Hackathon: Flip the Switch, Track 1. Deadline: Sat 7 Nov 2026, 7:29 PM WAT. **Internal cutoff: Sat 7 Nov, 2:00 PM WAT.**

Flow: `SAID IN ACME → ASKED IN ZENITH → AGENT TRIES TO LEAK → BLOCKED → LINKED ROOMS STILL SHARE`

Core guarantee: **A sensitive item first seen in room A never appears in a message in room B, unless A and B are linked.**

## 2. Source of truth

Read in this order before any work:
1. `PRD.md` — the only source of truth for requirements. Read the section you are building against and cite it (e.g. "PRD §12").
2. `PROJECT_STATE.md` — what is actually done. A progress log, not requirements.
3. The code. The repo beats any summary.

Support files: `ROADMAP.md` (parked ideas), `REAL_VS_MOCKED.md` (for judges), `README.md` (public). `Gate.js` is the Gate 0 stub — keep it, don't edit it.

- Never re-derive requirements from memory.
- The PRD is corrected by evidence. If something behaves differently from the PRD, stop, fix the PRD, log it in PRD §14 with the raw evidence.
- If a request conflicts with the PRD, update the PRD first. Never silently change scope.

## 3. Settled decisions

PRD §14 (decisions D1–D6, Gate 0 result). Treat them as settled; reopen only with new evidence.

## 4. Where you run (important)

**You are in a cloud environment.** You have Node and the repo. You do **not** have Docker, Switch, Mattermost, or Adesope's Windows PC, and you cannot reach his `localhost`.

- Build and verify everything that runs without Switch: unit tests, contract tests, the Leak Lab (PRD §16).
- The Switch wire contract is in PRD §12 and was proven live in Gate 0. Match it exactly. Don't guess fields that aren't there.
- Anything that needs live Switch (PRD §19) is done by Adesope on Windows. When a phase needs a live check, end your report with exact, copy-paste steps for him (PowerShell syntax), and what output proves success.
- Never claim a live result you didn't see. Write "not verified live" instead.

## 5. Commands

Fill this in Phase 1 from `package.json`, then keep it exact.

```bash
npm install
npm start          # RoomWall on PORT (default 8787)
npm test           # node:test unit + contract tests
npm run lab        # Leak Lab: seeded scenario, exits non-zero on any mismatch
npm run verify     # test + lab — the gate before saying "done"
```

## 6. Scope

P0 / P1 / Never: **PRD §22**. Endpoints: **PRD §12** (`/guardrails/check`, `/health`; `/wall` is P1).

- Node.js + Express only. No database, no AI/LLM calls, no React, no build step (PRD D3).
- New ideas go to `ROADMAP.md`, never into the build.
- Few dependencies. Express is the only expected runtime dependency; tests use `node:test`.

## 7. Invariants

All in **PRD §11** (INV-1…5) and must each have a test. The two easiest to break:
- **INV-2:** a blocked message records nothing.
- **INV-4:** wire findings never contain the source room name or the secret. Source room appears only in RoomWall's own log, Lab output and `/wall`.

General:
- Deterministic and synchronous core. Target < 100 ms per check — Switch fails open after 2 s (PRD §12).
- Unknown room ids work (shown by short id). A malformed request gets a 400 with a clear code, never a crash.
- No bare catch, no swallowed errors.

## 8. Honesty rules

- Never fabricate test counts, outputs, room ids or live results.
- Report test counts only after they pass, from the real output.
- `REAL_VS_MOCKED.md`, README and PRD §17 must agree.
- Every number (e.g. "5 blocked, 3 allowed") comes from the Lab output and is identical everywhere.
- Label targets as targets until measured. Limits go in README openly (e.g. reworded facts can slip through).

## 9. Gotchas

- Check the installed Express major before writing routes. Express 5: async errors reach the error handler natively; route path syntax changed from v4.
- Use `express.json()` with a sane size limit; Switch sends `{"messages":[...]}` only.
- Use Node ≥ 20 built-ins (`node:test`, `fetch`). Don't add test frameworks.
- Amount parsing: `4.5m`, `₦4,500,000` and `N4.5m` must match, but plain `3` must not (INV-5). Avoid float drift — normalise to integer units.
- Mattermost/Switch may send markdown (`**bold**`, links). Strip formatting before detection.

## 10. Code quality

- Pure core (`detectors`, `wall`) with no I/O; effects at the edges (`server`, `store` file writes).
- Small single-purpose files; split past ~200 lines.
- No comments: names explain the code. No dead code, TODOs or magic numbers (constants in one config module).
- Pin dependency versions exactly. Never commit secrets.

## 11. Phase workflow

Phases: **PRD §23**. One at a time.

Before: name the phase, state its acceptance criteria, inspect the code, pick the smallest change.
During: build only that phase.
Verify: run `npm run verify` and read the real output and exit code (not `| tail`).

**Continuous mode (Adesope's standing instruction):** when a phase meets its PRD §23 acceptance and `npm run verify` passes, write the phase report into `PROJECT_STATE.md`, commit, push, and go straight to the next phase. No approval wait.

**Stop and ask Adesope only when:**
- something must be done by hand (secrets/.env, accounts, anything on his Windows PC, live Switch checks — CLAUDE.md §4);
- `npm run verify` still fails after three honest attempts at the same problem;
- the PRD is wrong or contradicts itself and the fix would change scope or a §14 decision;
- you reach Phase 3 (live, local) — hand over exact steps, then keep going only with work that doesn't depend on its result.

**Phase report (in PROJECT_STATE.md build log and the commit body):**
- files changed
- tests run, with real pass/fail counts
- Lab output (when it exists)
- what still needs a live check, with exact steps for Adesope
- limits and anything sent to ROADMAP.md

## 12. Demo and recording

Demo script: **PRD §20**. Record each act the moment it works. The Lab must always produce PRD §16 exactly; if it changes, something broke.

## 13. Git

- Repo: https://github.com/london160771/RoomWall. Commit and push at the end of every phase that passes `npm run verify` (continuous mode, §11). Small commits inside a phase are fine.
- Never push a red build. Never force-push or rewrite history.
- Conventional messages (`feat:`, `fix:`, `docs:`, `test:`). Never commit secrets or `.env`.

## 14. Deadline discipline

After the internal cutoff: no features — only broken links, video access, README errors and final checks. After the deadline: no feature commits.

## 15. Done

A phase is done when its PRD §23 acceptance passes, `npm run verify` passes, the report is in `PROJECT_STATE.md`, and the commit is pushed. Project done: **PRD §26**.
