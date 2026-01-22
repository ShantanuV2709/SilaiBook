from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.expense import ExpenseCreate
from app.utils.bson import serialize_doc

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

# -------------------------
# Helpers
# -------------------------
def today_range():
    start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
    end = start + timedelta(days=1)
    return start, end


# -------------------------
# Add Expense
# -------------------------
@router.post("/")
def add_expense(
    expense: ExpenseCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    doc = expense.dict()
    doc["created_at"] = datetime.utcnow()

    result = db.expenses.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return {
        "message": "Expense added successfully",
        "expense": doc
    }


# -------------------------
# List Expenses (filters)
# -------------------------
@router.get("/")
def list_expenses(
    expense_type: Optional[str] = None,
    category: Optional[str] = None,
    payment_mode: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    query = {}

    if expense_type:
        query["expense_type"] = expense_type
    if category:
        query["category"] = category
    if payment_mode:
        query["payment_mode"] = payment_mode

    expenses = db.expenses.find(query).sort("created_at", -1)
    return [serialize_doc(e) for e in expenses]


# -------------------------
# Today's Expense (by type)
# -------------------------
@router.get("/today-total")
def today_expense_total(
    expense_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    start, end = today_range()

    match = {
        "created_at": {"$gte": start, "$lt": end}
    }

    if expense_type:
        match["expense_type"] = expense_type

    pipeline = [
        {"$match": match},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]

    result = list(db.expenses.aggregate(pipeline))
    return {"today_expense": result[0]["total"] if result else 0}


# -------------------------
# Monthly Expense Summary
# -------------------------
@router.get("/monthly-summary")
def monthly_expense_summary(
    year: int,
    month: int,
    expense_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    start = datetime(year, month, 1)
    end = datetime(year + (month // 12), ((month % 12) + 1), 1)

    match = {
        "created_at": {"$gte": start, "$lt": end}
    }

    if expense_type:
        match["expense_type"] = expense_type

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$category",
                "total": {"$sum": "$amount"}
            }
        }
    ]

    return {
        "year": year,
        "month": month,
        "expense_type": expense_type or "ALL",
        "breakdown": list(db.expenses.aggregate(pipeline))
    }
