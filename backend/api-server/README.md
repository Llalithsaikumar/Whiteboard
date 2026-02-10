## Whiteboard API Server

FastAPI service that stores and serves canvas state for each room.

### What it does
- REST API for saving, loading, and clearing canvas strokes
- Health check endpoint for uptime monitoring
- CORS configured for the frontend and realtime server

### Requirements
- Python 3.10+ (project currently runs on 3.11)

### Setup
1) Create and activate a virtual environment
	- Windows PowerShell
	  - `python -m venv venv`
	  - `venv\Scripts\Activate.ps1`
2) Install dependencies
	- `pip install -r requirements.txt`

### Run
- `uvicorn app.main:app --port 8000`

### Endpoints
- `GET /health/` -> `{ "status": "ok" }`
- `GET /canvas/` -> `{ "status": "ok" }`
- `POST /canvas/save` -> body: `{ "roomId": "...", "strokes": [...] }`
- `GET /canvas/{roomId}` -> returns strokes for a room
- `POST /canvas/clear` -> body: `{ "roomId": "..." }`

### Configuration
Defined in [app/core/config.py](app/core/config.py):
- `ALLOWED_ORIGINS`: default `http://localhost:3001` and `http://localhost:5173`

### Notes
- Data is stored via [app/services/canvas_store.py](app/services/canvas_store.py). If you change storage, keep API contracts consistent with the realtime server.
