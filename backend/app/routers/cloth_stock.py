from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.cloth_stock import ClothStockCreate
from app.utils.bson import serialize_doc
from bson import ObjectId

router = APIRouter(
    prefix="/cloth-stock",
    tags=["Cloth Stock"]
)

@router.post("/")
def add_cloth_stock(
    stock: ClothStockCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    # Try to find existing active stock with same identity
    existing = db.cloth_stock.find_one({
        "dealer_name": stock.dealer_name,
        "cloth_type": stock.cloth_type,
        "price_per_meter": stock.price_per_meter,
        "is_active": True
    })

    now = datetime.utcnow()

    if existing:
        # 🔁 RESTOCK: merge meters + update last stocked date
        db.cloth_stock.update_one(
            {"_id": existing["_id"]},
            {
                "$inc": {
                    "total_meters": stock.total_meters,
                    "remaining_meters": stock.total_meters
                },
                "$set": {
                    "last_stocked_at": now,
                    "updated_at": now
                }
            }
        )

        return {
            "message": "Existing cloth stock restocked successfully",
            "stock_id": str(existing["_id"]),
            "added_meters": stock.total_meters
        }

    # 🆕 FIRST TIME STOCK ENTRY
    doc = stock.dict()
    doc.update({
        "used_meters": 0,
        "remaining_meters": stock.total_meters,

        # IMPORTANT DATES
        "created_at": now,          # when this stock entry was created
        "last_stocked_at": now,     # when stock was last added
        "purchase_date": now,       # optional, but now meaningful

        "is_active": True,
        "created_by": current_user.get("username")
    })

    result = db.cloth_stock.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return {
        "message": "New cloth stock added successfully",
        "stock": doc
    }


@router.get("/")
def list_cloth_stock(
    low_stock: Optional[bool] = False,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    query = {"is_active": True}

    stocks = db.cloth_stock.find(query).sort("created_at", -1)

    result = []
    for stock in stocks:
        if low_stock and stock["remaining_meters"] > 10:
            continue
        result.append(serialize_doc(stock))

    return result

@router.post("/{stock_id}/use")
def use_cloth(
    stock_id: str,
    meters_used: int,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    stock = db.cloth_stock.find_one({"_id": ObjectId(stock_id)})
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    if meters_used > stock["remaining_meters"]:
        raise HTTPException(status_code=400, detail="Not enough cloth")

    new_remaining = stock["remaining_meters"] - meters_used

    # update stock
    db.cloth_stock.update_one(
        {"_id": ObjectId(stock_id)},
        {"$set": {"remaining_meters": new_remaining}},
    )

    # INSERT USAGE HISTORY
    db.cloth_usage.insert_one({
        "stock_id": ObjectId(stock_id),
        "dealer_name": stock["dealer_name"],
        "cloth_type": stock["cloth_type"],
        "used_meters": meters_used,
        "remaining_meters": new_remaining,
        "used_at": datetime.utcnow(),
        "used_by": current_user["username"],
    })

    return {
        "message": "Cloth usage updated",
        "used_meters": meters_used,
        "remaining_meters": new_remaining,
    }


@router.delete("/{stock_id}")
def delete_cloth_stock(
    stock_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = db.cloth_stock.update_one(
        {"_id": ObjectId(stock_id)},
        {"$set": {"is_active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Stock not found")

    return {"message": "Cloth stock removed"}

@router.put("/{stock_id}")
def update_cloth_stock(
    stock_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    update_data = {}

    if "dealer_name" in payload:
        update_data["dealer_name"] = payload["dealer_name"]

    if "cloth_type" in payload:
        update_data["cloth_type"] = payload["cloth_type"]

    if "price_per_meter" in payload:
        update_data["price_per_meter"] = payload["price_per_meter"]

    if "remaining_meters" in payload:
        update_data["remaining_meters"] = payload["remaining_meters"]

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = db.cloth_stock.update_one(
        {"_id": ObjectId(stock_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Stock not found")

    return {"message": "Cloth stock updated successfully"}


@router.get("/usage-history")
def cloth_usage_history(
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    history = db.cloth_usage.find().sort("used_at", -1)
    return [
        {
            **h,
            "_id": str(h["_id"]),
            "stock_id": str(h["stock_id"]),
            "order_id": str(h.get("order_id", "")),
            "cloth_type": h.get("cloth_type", "Unknown"),
            "dealer_name": h.get("dealer_name", "Unknown"),
            # 🔧 NORMALIZE KEYS: Frontend expects 'used_meters', but create_order saved 'meters_used'
            "used_meters": h.get("used_meters", h.get("meters_used", 0))
        }
        for h in history
    ]
