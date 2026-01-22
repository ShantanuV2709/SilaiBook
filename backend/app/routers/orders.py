from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.order import OrderCreate
from app.utils.bson import serialize_doc

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

VALID_STATUSES = ["Received", "Cutting", "Stitching", "Finishing", "Ready", "Delivered"]


@router.post("/")
def create_order(
    order: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    # 1️⃣ Validate customer
    customer = db.customers.find_one({
        "_id": ObjectId(order.customer_id),
        "is_active": True
    })

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2️⃣ Validate cloth & availability
    for c in order.cloth_items:
        stock = db.cloth_stock.find_one({"_id": ObjectId(c.cloth_stock_id)})
        if not stock:
            raise HTTPException(status_code=404, detail="Cloth stock not found")

        remaining = stock["total_meters"] - stock.get("used_meters", 0)
        if c.meters_used > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough cloth for {stock['cloth_type']}"
            )

    # 3️⃣ Generate order number
    order_number = f"ORD-{datetime.utcnow().year}-{db.orders.count_documents({}) + 1:04d}"

    # 4️⃣ Create order document
    doc = {
        "order_number": order_number,

        "customer_id": ObjectId(order.customer_id),
        "customer_name": customer["name"],
        "customer_mobile": customer["mobile"],

        "order_type": order.order_type,

        # IMPORTANT: snapshot
        "measurements_snapshot": order.measurements,

        "cloth_used": [
            {
                "cloth_stock_id": ObjectId(c.cloth_stock_id),
                "meters_used": c.meters_used
            }
            for c in order.cloth_items
        ],

        "delivery_date": datetime.combine(order.delivery_date, datetime.min.time()),
        "priority": order.priority,

        "status": "Received",
        "status_history": [{
            "status": "Received",
            "changed_at": datetime.utcnow(),
            "changed_by": current_user["username"]
        }],

        "assigned_karigar_id": None,
        "payment_id": None,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }

    result = db.orders.insert_one(doc)
    order_id = result.inserted_id

    # 5️⃣ Deduct cloth & log usage
    for c in order.cloth_items:
        db.cloth_stock.update_one(
            {"_id": ObjectId(c.cloth_stock_id)},
            {"$inc": {"used_meters": c.meters_used}}
        )

        db.cloth_usage.insert_one({
            "cloth_stock_id": ObjectId(c.cloth_stock_id),
            "meters_used": c.meters_used,
            "used_for": "Order",
            "reference_id": order_id,
            "customer_id": ObjectId(order.customer_id),
            "created_at": datetime.utcnow()
        })

    return {
        "message": "Order created successfully",
        "order_id": str(order_id),
        "order_number": order_number
    }


@router.get("/")
def list_orders(current_user: dict = Depends(get_current_user)):
    db = get_db()
    orders = db.orders.find({"is_active": True}).sort("created_at", -1)
    return [serialize_doc(o) for o in orders]



@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    db = get_db()

    result = db.orders.update_one(
        {"_id": ObjectId(order_id), "is_active": True},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            },
            "$push": {
                "status_history": {
                    "status": status,
                    "changed_at": datetime.utcnow(),
                    "changed_by": current_user["username"]
                }
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": "Order status updated"}
