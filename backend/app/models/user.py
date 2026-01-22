from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserDB(BaseModel):
    username: str
    password_hash: str
    role: str
    created_at: datetime
    is_active: bool

class UserLogin(BaseModel):
    username: str
    password: str