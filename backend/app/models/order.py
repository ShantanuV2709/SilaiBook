from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import date
from enum import Enum


class OrderStatus(str, Enum):
    Received = "Received"
    Cutting = "Cutting"
    Stitching = "Stitching"
    Finishing = "Finishing"
    Ready = "Ready"
    Delivered = "Delivered"


class ClothItem(BaseModel):
    cloth_stock_id: str
    meters_used: float = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: str
    order_type: str
    price: float = 0
    advance_amount: float = 0  # Added for invoice
    measurements: Dict
    cloth_items: List[ClothItem]
    delivery_date: date
    priority: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id: str = Field(alias="_id")

    customer_id: str
    order_type: str
    price: float = 0
    advance_amount: float = 0  # Added for invoice

    measurements_snapshot: Optional[Dict]

    cloth_items: List[ClothItem]

    status: OrderStatus
    delivery_date: date

    created_at: Optional[str]
    updated_at: Optional[str]
