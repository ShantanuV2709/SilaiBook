from fastapi import APIRouter, Depends
from app.core.auth_dependencies import get_current_user

router = APIRouter(
    prefix="/protected",
    tags=["Protected"]
)

@router.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return {
        "message": "You are authenticated",
        "user": current_user
    }
