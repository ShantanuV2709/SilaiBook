from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeCreate(BaseModel):
    name: str
    contact: str
    work_type: str          # Cutting / Stitching / Finishing
    salary_type: str        # Daily / Monthly
    salary_amount: float
    advance_paid: float = 0

class EmployeeDB(EmployeeCreate):
    created_at: datetime
    is_active: bool
