# Codeproof

## What It Is

Codeproof is a **collaborative code editor with session recording and playback**. Two people join a room, code together in real-time, and the entire session is captured as a replayable timeline — every keystroke, deletion, cursor movement, and code execution event, all timestamped.

The replay is the product. CoderPad and HackerRank show final code. Codeproof shows *how* someone got there.

## Core Use Case

Technical interviews and mock interview prep. After a session, both parties get a scrubbable timeline replay: when the candidate got stuck, what they deleted, how long they spent on each section, and whether they pasted code. Candidates can share replay links on resumes as proof of their problem-solving process.

## Architecture

- **Frontend:** Next.js + CodeMirror 6 (chosen over Monaco for native CRDT compatibility)
- **Backend:** Go — handles WebSocket connections, room management, session persistence
- **Real-time Collaboration:** Yjs (CRDT library) with CodeMirror 6 bindings — the Go backend acts as signaling and persistence layer
- **Code Execution:** Judge0 or Piston API for sandboxed execution (not rolling custom Docker orchestration for MVP)
- **Auth:** GitHub OAuth
- **Database:** PostgreSQL for users, rooms, metadata
- **Session Storage:** Event-sourced keystroke log (JSON events, ~80KB compressed per 45-min session)
- **Deploy:** Vercel (frontend) + Railway or Fly.io (Go backend)

## Key Technical Concepts

- **CRDTs via Yjs** — conflict-free real-time collaborative editing between multiple clients
- **Event Sourcing** — every CRDT operation is serialized with timestamps, cursor positions, selections, and execution events into a persistent event log
- **Replay Engine** — a timeline scrubber UI that deserializes and replays the event log, effectively a "video player for code editing"
- **WebSocket Pipeline** — real-time bidirectional communication between editor clients and Go backend

## What Is NOT in Scope (MVP)

- Online assessment platform features (question banks, test cases, candidate management, accepted languages, time limits)
- Custom Docker/gVisor sandboxed execution (using Judge0/Piston instead)
- Analytics dashboards
- Interview question templates

These can be added post-MVP but are explicitly deferred.

## 10-Week Build Plan

| Weeks | Milestone |
|-------|-----------|
| 1–2 | Editor foundation — Next.js + CodeMirror 6 + Go WebSocket pipe working end-to-end |
| 3–4 | CRDT collaboration via Yjs — two tabs editing the same document in real-time |
| 5 | GitHub OAuth + room/session system + PostgreSQL |
| 6 | Code execution via Judge0/Piston API |
| 7–9 | Session recorder + replay engine (the core differentiator) |
| 10 | Deploy, polish, README, demo video |

## Why This Project Exists

It targets FAANG and quant firm internships. The project demonstrates real-time systems, distributed systems thinking (CRDTs), event sourcing (a system design interview pattern), and full-stack competency. The differentiator over "I built a collab editor" is that the replay engine turns it into a product with a reason to exist.
