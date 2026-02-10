from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def health_check() -> dict:
	return {"status": "ok"}
