from pydantic import BaseModel
from datetime import datetime

class ClothStockCreate(BaseModel):
    dealer_name: str
    cloth_type: str
    total_meters: float
    price_per_meter: float

class ClothStockDB(ClothStockCreate):
    used_meters: float = 0
    remaining_meters: float
    purchase_date: datetime
    created_at: datetime
    is_active: bool