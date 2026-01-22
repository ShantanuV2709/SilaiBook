from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    amount: float
    category: str              # Rent, Salary, Cloth Purchase
    expense_type: str          # SHOP / EMPLOYEE / STOCK / OTHER
    payment_mode: str          # Cash / UPI / Bank
    remarks: Optional[str] = None

class ExpenseDB(ExpenseCreate):
    created_at: datetime
