from fastapi import APIRouter, HTTPException
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import UserCreate, UserLogin
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate):
    db = get_db()

    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="User already exists")

    db.users.insert_one({
        "username": user.username,
        "password_hash": hash_password(user.password),
        "role": "owner",
        "created_at": datetime.utcnow(),
        "is_active": True
    })

    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db = get_db()
    db_user = db.users.find_one({"username": user.username})

    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": db_user["username"],
        "role": db_user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
