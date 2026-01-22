from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.database import get_db

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_db()
    user = db.users.find_one({"username": username})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "username": user["username"],
        "role": user["role"]
    }
