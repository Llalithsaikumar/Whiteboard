## Whiteboard Realtime Server

Node.js + Socket.IO server that handles live collaboration and relays canvas updates. It also persists full canvas state to the Python API server.

### What it does
- Manages websocket rooms and users
- Broadcasts live drawing events and cursor updates
- Persists canvas state via the Python API server

### Requirements
- Node.js 18+ (ESM)
- Python API server running on port 8000

### Setup
- `npm install`

### Run (development)
- `npm run dev`

### Ports
- Realtime server: `http://localhost:3001`
- Frontend dev server: `http://localhost:5173`
- Python API: `http://localhost:8000`

### Configuration
Defaults are in [src/config/env.js](src/config/env.js):
- `PORT` (default 3001)
- `CLIENT_ORIGIN` (default http://localhost:5173)
- `PYTHON_API_URL` (default http://localhost:8000)

### Socket events
- `join-room` -> join a room and receive initial canvas state
- `draw` -> live drawing updates (not persisted)
- `stroke-complete` -> persist full canvas after a stroke
- `cursor-move` -> broadcast pointer location
- `clear-canvas` -> clear room canvas and persist
- `leave-room` -> leave a room

### Notes
- Socket handlers live in [src/socket](src/socket). The Python API client is in [src/services/pythonApi.js](src/services/pythonApi.js).
