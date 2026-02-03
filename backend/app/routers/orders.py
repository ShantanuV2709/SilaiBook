from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
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

VALID_STATUSES = [
    "Received",
    "Cutting",
    "Stitching",
    "Finishing",
    "Ready",
    "Delivered"
]


# =========================
# CREATE ORDER
# =========================
@router.post("/")
def create_order(
    order: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    customer = db.customers.find_one({
        "_id": ObjectId(order.customer_id),
        "is_active": True
    })

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate cloth availability
    for c in order.cloth_items:
        stock = db.cloth_stock.find_one({"_id": ObjectId(c.cloth_stock_id)})
        if not stock:
            raise HTTPException(status_code=404, detail="Cloth stock not found")

        remaining = stock.get("remaining_meters")
        if remaining is None:
            remaining = stock["total_meters"] - stock.get("used_meters", 0)

        if c.meters_used > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough cloth for {stock['cloth_type']}"
            )

    order_number = f"ORD-{datetime.utcnow().year}-{db.orders.count_documents({}) + 1:04d}"

    doc = {
        "order_number": order_number,
        "customer_id": ObjectId(order.customer_id),
        "customer_name": customer["name"],
        "customer_mobile": customer["mobile"],
        "order_type": order.order_type,
        "price": order.price,
        "advance_amount": order.advance_amount,
        "measurements_snapshot": order.measurements,

        # 🔒 immutable snapshot
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

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }

    result = db.orders.insert_one(doc)

    # Deduct cloth immediately AND log usage
    # Deduct cloth immediately AND log usage
    for c in order.cloth_items:
        # 🟢 RE-FETCH stock to ensure we have the correct doc for THIS item
        stock = db.cloth_stock.find_one({"_id": ObjectId(c.cloth_stock_id)})
        
        db.cloth_stock.update_one(
            {"_id": ObjectId(c.cloth_stock_id)},
            {
                "$inc": {
                    "used_meters": c.meters_used,
                    "remaining_meters": -c.meters_used,
                }
            }
        )

        # 🧾 LOG USAGE
        db.cloth_usage.insert_one({
            "stock_id": ObjectId(c.cloth_stock_id),
            "order_id": result.inserted_id,
            "used_meters": c.meters_used, # ✅ Renamed from meters_used to used_meters for consistency
            "used_for": f"{order.order_type} ({customer['name']})", # Added Customer Name to 'Used For'
            "cloth_type": stock.get("cloth_type", "Unknown") if stock else "Unknown",
            "dealer_name": stock.get("dealer_name", "Unknown") if stock else "Unknown",
            "used_by": current_user.get("username", "System"),
            "used_at": datetime.utcnow(),
            "stage": "Order Created"
        })

    return {
        "message": "Order created successfully",
        "order_id": str(result.inserted_id),
        "order_number": order_number
    }


# =========================
# LIST ORDERS
# =========================
@router.get("/")
def list_orders(
    customer_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    query = {"is_active": True}
    if customer_id:
        query["customer_id"] = ObjectId(customer_id)
        
    orders = db.orders.find(query).sort("created_at", -1)
    return [serialize_doc(o) for o in orders]


# =========================
# GET SINGLE ORDER
# =========================
@router.get("/{order_id}")
def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)


# =========================
# UPDATE STATUS (NON-READY)
# =========================
@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if status == "Ready":
        raise HTTPException(
            status_code=400,
            detail="Use mark-ready endpoint to set Ready"
        )

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


# =========================
# MARK READY (CONFIRMED)
# =========================
@router.post("/{order_id}/mark-ready")
def mark_order_ready(
    order_id: str,
    confirm: bool = Query(...),
    user=Depends(get_current_user)
):
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required to mark order as Ready"
        )

    db = get_db()

    order = db.orders.find_one({
        "_id": ObjectId(order_id),
        "is_active": True
    })

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != "Finishing":
        raise HTTPException(
            status_code=400,
            detail="Order must be in Finishing state"
        )

    now = datetime.utcnow()

    # ✅ USE cloth_used (this matches create_order)
    for item in order.get("cloth_used", []):
        cloth_id = item["cloth_stock_id"]
        meters_used = item["meters_used"]

        stock = db.cloth_stock.find_one({"_id": cloth_id})
        if not stock:
            raise HTTPException(status_code=404, detail="Cloth stock not found")

        # 🧾 LOG USAGE
        db.cloth_usage.insert_one({
            "stock_id": cloth_id,
            "order_id": order["_id"],
            "meters_used": meters_used,
            "used_for": order["order_type"],
            "used_by": user["username"],
            "used_at": now,
            "stage": "Ready"
        })

    # ✅ UPDATE ORDER STATUS
    db.orders.update_one(
        {"_id": order["_id"]},
        {
            "$set": {
                "status": "Ready",
                "ready_at": now,
                "updated_at": now
            },
            "$push": {
                "status_history": {
                    "status": "Ready",
                    "changed_at": now,
                    "changed_by": user["username"]
                }
            }
        }
    )

    return {"message": "Order marked Ready & cloth deducted"}
