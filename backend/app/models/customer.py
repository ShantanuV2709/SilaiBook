from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class CustomerCreate(BaseModel):
    name: str
    mobile: str
    category: Optional[str] = None
    measurements: Optional[Dict] = {}

class CustomerDB(CustomerCreate):
    created_at: datetime
    is_active: bool = True
