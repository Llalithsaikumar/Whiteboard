from pydantic import BaseModel
from typing import List, Dict, Any


class SaveCanvasRequest(BaseModel):
    roomId: str
    strokes: List[Dict[str, Any]]
