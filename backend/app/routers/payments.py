from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import Optional

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.payment import PaymentCreate
from app.utils.bson import serialize_doc

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

# -------------------------------
# CREATE PAYMENT
# -------------------------------
@router.post("/")
def add_payment(
    payment: PaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    customer = db.customers.find_one({
        "_id": ObjectId(payment.customer_id),
        "is_active": True
    })

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payment.paid_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    # -------------------------------
    # SAFE DUE DATE HANDLING
    # -------------------------------
    due_date = None
    if getattr(payment, "due_date", None):
        if isinstance(payment.due_date, str):
            try:
                due_date = datetime.fromisoformat(payment.due_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid due date format")
        elif isinstance(payment.due_date, datetime):
            due_date = payment.due_date

    doc = {
        "customer_id": ObjectId(payment.customer_id),
        "customer_name": customer["name"],
        "total_bill": payment.total_bill,
        "paid_amount": payment.paid_amount,
        "payment_mode": payment.payment_mode,
        "due_date": due_date,
        "created_at": datetime.utcnow(),
        "created_by": current_user["username"],
    }

    db.payments.insert_one(doc)

    return {
        "message": "Payment recorded successfully"
    }

# -------------------------------
# LIST PAYMENTS BY CUSTOMER
# -------------------------------
@router.get("/customer/{customer_id}")
def customer_payments(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    payments = db.payments.find({
        "customer_id": ObjectId(customer_id)
    }).sort("created_at", -1)

    return [serialize_doc(p) for p in payments]

# -------------------------------
# LIST ALL PAYMENTS
# -------------------------------
@router.get("/")
def list_payments(
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    payments = db.payments.find().sort("created_at", -1)

    return [
        {
            **p,
            "_id": str(p["_id"]),
            "customer_id": str(p["customer_id"]),
        }
        for p in payments
    ]

# -------------------------------
# CUSTOMER PAYMENT SUMMARY
# -------------------------------
@router.get("/customer-summary")
def customer_payment_summary(
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    pipeline = [
        {
            "$group": {
                "_id": "$customer_id",
                "customer_name": {"$last": "$customer_name"},
                "total_bill": {"$sum": "$total_bill"},
                "paid_amount": {"$sum": "$paid_amount"},
                "last_payment_date": {"$max": "$created_at"},
                "due_date": {"$last": "$due_date"},
            }
        },
        {
            "$addFields": {
                "remaining_amount": {
                    "$subtract": ["$total_bill", "$paid_amount"]
                },
                "status": {
                    "$cond": [
                        {"$lte": [{"$subtract": ["$total_bill", "$paid_amount"]}, 0]},
                        "Paid",
                        "Partial"
                    ]
                }
            }
        },
        {"$sort": {"last_payment_date": -1}}
    ]

    result = list(db.payments.aggregate(pipeline))

    return [
        {
            "customer_id": str(r["_id"]),
            "customer_name": r["customer_name"],
            "total_bill": r["total_bill"],
            "paid_amount": r["paid_amount"],
            "remaining_amount": r["remaining_amount"],
            "status": r["status"],
            "last_payment_date": r["last_payment_date"],
            "due_date": r.get("due_date"),
        }
        for r in result
    ]

# -------------------------------
# DELETE PAYMENT
# -------------------------------
@router.delete("/{payment_id}")
def delete_payment(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    result = db.payments.delete_one({
        "_id": ObjectId(payment_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    return {"message": "Payment deleted successfully"}
