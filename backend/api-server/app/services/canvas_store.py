from typing import Dict, Any, List

# In-memory store
# roomId -> list of strokes
_canvas_store: Dict[str, List[Dict[str, Any]]] = {}

def save_canvas(room_id: str, strokes: List[Dict[str, Any]]) -> None:
    """Save or overwrite the canvas for a room."""
    _canvas_store[room_id] = strokes

def load_canvas(room_id: str) -> List[Dict[str, Any]]:
    """
    Load the canvas for a room. 
    Returns an empty list if no canvas exists.

    """
    return _canvas_store.get(room_id, [])

def clear_canvas(room_id: str) -> None:
    """Clear the canvas for a room."""
    _canvas_store.pop(room_id, None)