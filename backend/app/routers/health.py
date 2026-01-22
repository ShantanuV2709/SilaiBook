from fastapi import APIRouter
from app.core.database import get_db

router = APIRouter()

@router.get("/health")
def health_check():
    db = get_db()
    return {
        "status": "ok",
        "database": db.name
    }
