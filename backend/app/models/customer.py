from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class CustomerCreate(BaseModel):
    name: str
    mobile: str
    category: Optional[str] = None
    measurements: Optional[Dict] = {}
    photo_url: Optional[str] = None  # Can store base64 or URL

class CustomerDB(CustomerCreate):
    created_at: datetime
    is_active: bool = True
