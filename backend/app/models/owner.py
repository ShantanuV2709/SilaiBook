from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OwnerBase(BaseModel):
    name: str = Field(..., min_length=2)
    role: str = "Partner"  # Partner, Investor, Manager
    share_percentage: float = Field(0.0, ge=0, le=100)
    mobile: Optional[str] = None
    email: Optional[str] = None

class OwnerCreate(OwnerBase):
    initial_investment: float = 0.0
    joined_date: Optional[datetime] = None

class OwnerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    share_percentage: Optional[float] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class OwnerOut(OwnerBase):
    id: str = Field(..., alias="_id")
    initial_investment: float
    total_withdrawn: float = 0.0
    created_at: datetime
    is_active: bool

    class Config:
        allow_population_by_field_name = True
