# Collaborative Whiteboard

A real-time, multi-user whiteboard application for teams and classrooms. Users draw on a shared canvas, see each other's strokes instantly, and can join ongoing sessions without losing any history.

## Features

- 🎨 **Real-time Drawing**: See other users' strokes instantly as they draw
- 🛠️ **Rich Toolbar**: Pen tool with adjustable color and stroke width
- 🔍 **Zoom Controls**: Zoom in/out for precise drawing
- 💾 **Persistent Storage**: Canvas state is persisted and recoverable
- 🚀 **WebSocket-based**: Fast, websocket-based real-time communication
- 🏠 **Room-based Sessions**: Multiple collaborative rooms with isolated canvases
- ✏️ **Undo/Redo Support**: Full undo and redo history tracking
- 🔄 **Auto-sync**: Automatic synchronization when joining existing sessions

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | UI, canvas rendering, real-time input |
| **Realtime Server** | Node.js + Socket.IO + Express | WebSocket event handling, room management |
| **Backend API** | FastAPI + Pydantic | Canvas state persistence and REST endpoints |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                               │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │  Canvas Layer   │   │  Toolbar        │   │  Zoom Controls  │           │
│  │  (drawing)      │   │  (tools/colors) │   │  (undo/redo)    │           │
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
│                    REALTIME SERVER (Node.js + Socket.IO)                      │
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
│                    API SERVER (FastAPI + Pydantic)                            │
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

## Prerequisites

- **Node.js** 18+ (for realtime server and frontend)
- **Python** 3.11+ (for API server)
- **npm** or **yarn** (for package management)

---

## Project Structure

```
Whiteboard/
├── README.md                 # This file
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/       # Canvas, Toolbar, ZoomControls, etc.
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── api-server/          # FastAPI server
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/         # Route definitions
│   │   │   ├── core/        # Configuration
│   │   │   ├── models/      # Data models
│   │   │   ├── schemas/     # Pydantic schemas
│   │   │   └── services/    # Business logic
│   │   ├── requirements.txt
│   │   └── README.md
│   └── realtime-server/     # Node.js + Socket.IO
│       ├── src/
│       │   ├── index.js
│       │   ├── config/
│       │   ├── socket/      # Socket event handlers
│       │   ├── services/    # External API clients
│       │   └── utils/
│       ├── package.json
│       └── README.md
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Whiteboard
```

### 2. Start the API Server

```bash
cd backend/api-server

# Create virtual environment (Windows PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1

# Or on Linux/Mac
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run on port 8000
uvicorn app.main:app --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 3. Start the Realtime Server

```bash
cd backend/realtime-server

# Install dependencies
npm install

# Run development server on port 3001
npm run dev
```

**Expected output:**
```
Server running on port 3001
```

### 4. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server on port 5173
npm run dev
```

**Expected output:**
```
  VITE v... ready in ... ms

  ➜  local:   http://localhost:5173/
```

### 5. Open in Browser

Navigate to **http://localhost:5173** in your browser.

---

## Usage

1. **Draw**: Use the pen tool in the toolbar to draw on the canvas.
2. **Change Color**: Click the color picker and select a color.
3. **Adjust Width**: Use the width slider to change stroke thickness.
4. **Zoom**: Use zoom controls to zoom in/out on the canvas.
5. **Undo/Redo**: Use the undo/redo buttons or keyboard shortcuts (Ctrl+Z / Ctrl+Y).
6. **Clear Canvas**: Click "Clear Canvas" to clear all strokes (with confirmation).
7. **Multiple Rooms**: Each `roomId` is a separate collaborative session.

---

## API Endpoints

### Health Check

```bash
GET /health/
```

Response:
```json
{
  "status": "ok"
}
```

### Get Canvas

```bash
GET /canvas/{roomId}
```

Response:
```json
{
  "roomId": "room-1",
  "strokes": [
    { "from": {"x": 10, "y": 20}, "to": {"x": 30, "y": 40}, "color": "#000000", "width": 4 }
  ]
}
```

### Save Canvas

```bash
POST /canvas/save
```

Body:
```json
{
  "roomId": "room-1",
  "strokes": [...]
}
```

### Clear Canvas

```bash
POST /canvas/clear
```

Body:
```json
{
  "roomId": "room-1"
}
```

---

## Configuration

### Frontend

- **Socket.IO Server**: `http://localhost:3001` (configured in [frontend/src/App.jsx](frontend/src/App.jsx))
- **Room ID**: `room-1` (default, change in App.jsx)

### Realtime Server

Located in [backend/realtime-server/src/config/env.js](backend/realtime-server/src/config/env.js):

```javascript
PORT = 3001                           // WebSocket server port
CLIENT_ORIGIN = http://localhost:5173 // CORS allowed origin
PYTHON_API_URL = http://localhost:8000 // Backend API URL
```

### API Server

Located in [backend/api-server/app/core/config.py](backend/api-server/app/core/config.py):

```python
ALLOWED_ORIGINS = ["http://localhost:3001", "http://localhost:5173"]
```

---

## Socket.IO Events Reference

### Client-to-Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId }` | Join a collaborative room |
| `draw` | `{ roomId, from: {x, y}, to: {x, y}, color, width }` | Send live drawing data |
| `stroke-complete` | `{ roomId, stroke }` | Mark stroke as complete (triggers persist) |
| `cursor-move` | `{ roomId, position: {x, y} }` | Update cursor position |
| `clear-canvas` | `{ roomId }` | Clear all canvas strokes |
| `leave-room` | `{ roomId }` | Leave a collaborative room |

### Server-to-Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `canvas-state` | `{ roomId, strokes }` | Initial canvas state on join |
| `draw` | `{ roomId, from, to, color, width }` | Incoming stroke from another user |
| `stroke-complete` | `{ roomId, stroke }` | Another user completed a stroke |
| `cursor-move` | `{ roomId, userId, position }` | Another user moved cursor |
| `clear-canvas` | `{ roomId }` | Canvas was cleared |

---

## Development

### Debugging

1. **Frontend**: Use React DevTools and browser console.
2. **Realtime Server**: Check terminal output and enable debug logging.
3. **API Server**: Check FastAPI docs at `http://localhost:8000/docs`.

### Hot Module Replacement (HMR)

The frontend supports HMR via Vite. Changes in React components will hot-reload without losing state.

### Database / Persistence

Currently, canvas data is stored in-memory via [backend/api-server/app/services/canvas_store.py](backend/api-server/app/services/canvas_store.py). To persist to a database:

1. Update `canvas_store.py` to use your database (PostgreSQL, MongoDB, etc.).
2. Keep API contract consistent with current endpoints.
3. Update Realtime Server's Python API client if needed.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused on port 3001 | Ensure Realtime Server is running: `npm run dev` in `backend/realtime-server` |
| Canvas not loading on join | Check API Server is running on port 8000 |
| CORS errors | Verify ALLOWED_ORIGINS in API server config matches your frontend URL |
| Strokes not persisting | Check Network tab in DevTools for failed POST requests to `/canvas/save` |
| Zoom not working | Ensure Canvas component is rendering in frontend |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## Performance Notes

- **Canvas Rendering**: Uses native Canvas API for optimal performance
- **WebSocket Messages**: Live drawing events are not persisted immediately; only completed strokes are saved
- **Room Isolation**: Each room maintains its own state, allowing multiple concurrent sessions
- **Late Joiners**: Full canvas history is loaded from API Server, enabling seamless room recovery

---

## Future Enhancements

- [ ] User presence indicators (see who's drawing)
- [ ] Multiple drawing tools (eraser, shapes, text)
- [ ] Layer support
- [ ] Canvas export (PNG, SVG)
- [ ] Collaborative cursors with user names
- [ ] Real-time collaboration metrics and analytics
- [ ] Dark mode
- [ ] Mobile responsiveness

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
