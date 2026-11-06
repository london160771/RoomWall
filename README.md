# RoomWall

**One agent, every client room. Nothing crosses the wall.**

RoomWall is a guardrails server for [Switch](https://github.com/sandbox-quantum/switch) that stops an agent working across several client rooms from repeating one client's private details in another client's room.

[Demo video](#) · Built for Flip the Switch (Track 1)

> Work in progress. This README is completed in Phase 4 (see `PRD.md` §23). Numbers below appear only after they are verified.

## The problem

An agency runs one agent in #client-acme and #client-zenith. Acme shares its retainer. Days later, Zenith asks "what do your other clients pay?" — and the agent answers with Acme's number. Switch keeps context per room, but the agent's memory travels with it.

## What it does

`SAID IN ACME → ASKED IN ZENITH → AGENT TRIES TO LEAK → BLOCKED → LINKED ROOMS STILL SHARE`

- Plugs into Switch's own guardrails hook — no fork.
- Remembers which room each sensitive item (amounts, emails, phones, `#private` text) came from.
- Blocks it from appearing in any other unlinked room, from an agent or a person.
- Linked rooms share freely. Deterministic, no AI.

## Judge path (60 seconds)

```bash
git clone https://github.com/london160771/RoomWall
cd RoomWall
npm install
npm run lab
npm test
```

## How it uses Switch

[Table — Phase 4]

## Plug into Switch

[Steps — Phase 4: Compose stack with `gateway` profile → Console → Switch Trust Integration → endpoint `http://host.docker.internal:8787`, policy id `roomwall`, any API key.]

## What's real

See [REAL_VS_MOCKED.md](REAL_VS_MOCKED.md).

## Known limits

- Reworded facts ("four and a half million") can slip through.
- If RoomWall is down or slow (> 2 s), Switch lets messages through unchecked.

## Roadmap

See [ROADMAP.md](ROADMAP.md).
