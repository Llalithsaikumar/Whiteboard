# Collaborative Whiteboard

A real-time, multi-user whiteboard for teams and classrooms. Users draw on a shared canvas, see each other's strokes instantly, and can join ongoing sessions without losing any history.

---

## Overview

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | React + Vite, Canvas API | Rendering and user input |
| Realtime | Node.js, Express, Socket.IO | Live event broadcast and room management |
| Persistence | FastAPI, Pydantic | Canvas storage and recovery |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │  Canvas Layer   │   │  Toolbar        │   │  User Cursors   │           │
│  │  (drawing)      │   │  (tools/colors) │   │  (presence)     │           │
│  └────────┬────────┘   └─────────────────┘   └─────────────────┘           │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │         Socket.IO Client                │                               │
│  │  draw | stroke-complete | cursor-move   │                               │
│  └────────────────────┬────────────────────┘                               │
└───────────────────────┼─────────────────────────────────────────────────────┘
                        │ WebSocket
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                         REALTIME SERVER (Node.js)                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐             │
│  │  Room Manager   │   │  Event Handler  │   │  Python API     │             │
│  │  (users, state) │   │  (broadcast)    │   │  Client         │             │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘             │
│           │                     │                     │                       │
│           └─────────────────────┴─────────────────────┘                       │
│                                 │                                             │
└─────────────────────────────────┼─────────────────────────────────────────────┘
                                  │ HTTP
                                  ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           API SERVER (FastAPI)                                │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐             │
│  │  /health        │   │  /canvas/save   │   │  /canvas/{room} │             │
│  │  (readiness)    │   │  (persist)      │   │  (load)         │             │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘             │
│                                 │                                             │
│                                 ▼                                             │
│                        ┌─────────────────┐                                   │
│                        │  Canvas Store   │                                   │
│                        │  (in-memory/db) │                                   │
│                        └─────────────────┘                                   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌──────────┐         ┌──────────────────┐         ┌─────────────┐
│  Client  │         │  Realtime Server │         │  API Server │
└────┬─────┘         └────────┬─────────┘         └──────┬──────┘
     │                        │                          │
     │  1. join-room          │                          │
     │───────────────────────>│                          │
     │                        │  2. GET /canvas/{room}   │
     │                        │─────────────────────────>│
     │                        │                          │
     │                        │  3. strokes[]            │
     │                        │<─────────────────────────│
     │  4. canvas-state       │                          │
     │<───────────────────────│                          │
     │                        │                          │
     │  5. draw (live)        │                          │
     │───────────────────────>│                          │
     │                        │  6. broadcast            │
     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─>  other clients │
     │                        │                          │
     │  7. stroke-complete    │                          │
     │───────────────────────>│                          │
     │                        │  8. POST /canvas/save    │
     │                        │─────────────────────────>│
     │                        │                          │
```

---

## Collaboration Model

- **Room-based sessions**: Each whiteboard is a room with a unique `roomId`.
- **Instant feedback**: Live `draw` events render immediately on all clients.
- **Durable strokes**: Completed strokes are persisted so late joiners see full history.
- **Cursor presence**: Users see each other's pointer positions in real time.

---

## Backend Components

### Realtime Server

Located in [backend/realtime-server](backend/realtime-server).

| Module | Responsibility |
|--------|----------------|
| Room Manager | Track users, strokes, and cursors per room |
| Event Handler | Receive and broadcast socket events |
| Python API Client | Save and load canvas via HTTP |

### API Server

Located in [backend/api-server](backend/api-server).

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health/` | GET | Readiness check |
| `/canvas/{roomId}` | GET | Load strokes for a room |
| `/canvas/save` | POST | Persist strokes |
| `/canvas/clear` | POST | Clear a room |

---

## Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-room` | Client → Server | `{ roomId }` |
| `canvas-state` | Server → Client | `{ roomId, strokes }` |
| `draw` | Bidirectional | `{ roomId, from, to, color, width }` |
| `stroke-complete` | Client → Server | `{ roomId, stroke }` |
| `cursor-move` | Bidirectional | `{ roomId, position }` |
| `clear-canvas` | Client → Server | `{ roomId }` |
| `leave-room` | Client → Server | `{ roomId }` |

---

## Implementation Roadmap

| Phase | Focus | Features |
|-------|-------|----------|
| 1 | Core | Room join/leave, live drawing, persistence, late-join recovery |
| 2 | Reliability | Throttled events, full stroke replay, undo/redo |
| 3 | UX | Toolbar (pen, eraser, shapes), cursor presence, export |
| 4 | Production | Database storage, auth, rate limiting, horizontal scaling |

---

## Future Options

- **CRDT sync**: Integrate Yjs or Liveblocks for conflict-free collaboration.
- **Auth**: Add JWT, OAuth, or Clerk for user identity and permissions.
