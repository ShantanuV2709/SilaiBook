from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional

class PaymentCreate(BaseModel):
    customer_id: str
    total_bill: float
    paid_amount: float
    payment_mode: Optional[str] = "Cash"
    due_date: Optional[date] = None


class PaymentDB(PaymentCreate):
    remaining_amount: float
    status: str
    created_at: datetime
