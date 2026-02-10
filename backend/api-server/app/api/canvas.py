from fastapi import APIRouter
from app.schemas.canvas import SaveCanvasRequest
from app.services.canvas_store import save_canvas, load_canvas, clear_canvas

router = APIRouter()


@router.get("/")
def get_canvas_root():
    return {"status": "ok"}


@router.post("/save")
def save_canvas_api(payload: SaveCanvasRequest):
    save_canvas(payload.roomId, payload.strokes)
    return {
        "message": "canvas saved",
        "roomId": payload.roomId,
        "strokesCount": len(payload.strokes),
    }


@router.get("/{roomId}")
def load_canvas_api(roomId: str):
    strokes = load_canvas(roomId)
    return {
        "roomId": roomId,
        "strokes": strokes,
    }


@router.post("/clear")
def clear_canvas_api(payload: dict):
    clear_canvas(payload.get("roomId"))
    return {
        "message": "canvas cleared",
        "roomId": payload.get("roomId"),
    }
