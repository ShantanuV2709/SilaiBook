from fastapi import APIRouter, Depends
from datetime import datetime, timedelta,timezone

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

def today_range():
    start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
    end = start + timedelta(days=1)
    return start, end

@router.get("/today-income")
def today_income(current_user: dict = Depends(get_current_user)):
    db = get_db()
    start, end = today_range()

    pipeline = [
        {"$match": {"created_at": {"$gte": start, "$lt": end}}},
        {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}
    ]

    result = list(db.payments.aggregate(pipeline))
    return {"today_income": result[0]["total"] if result else 0}

@router.get("/pending-amount")
def pending_amount(current_user: dict = Depends(get_current_user)):
    db = get_db()

    pipeline = [
        {"$match": {"status": {"$in": ["Partial", "Unpaid"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$remaining_amount"}}}
    ]

    result = list(db.payments.aggregate(pipeline))
    return {"pending_amount": result[0]["total"] if result else 0}

@router.get("/stock-summary")
def stock_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()

    total_remaining = list(db.cloth_stock.aggregate([
        {"$match": {"is_active": True}},
        {"$group": {"_id": None, "meters": {"$sum": "$remaining_meters"}}}
    ]))

    low_stock = db.cloth_stock.count_documents({
        "remaining_meters": {"$lt": 10},
        "is_active": True
    })

    return {
        "total_remaining_meters": total_remaining[0]["meters"] if total_remaining else 0,
        "low_stock_items": low_stock
    }

@router.get("/customer-count")
def customer_count(current_user: dict = Depends(get_current_user)):
    db = get_db()
    count = db.customers.count_documents({"is_active": True})
    return {"total_customers": count}

def month_range(year: int, month: int):
    start = datetime(year, month, 1)
    end = datetime(year + (month // 12), ((month % 12) + 1), 1)
    return start, end

def total_income(db, start=None, end=None):
    match = {}
    if start and end:
        match["created_at"] = {"$gte": start, "$lt": end}

    pipeline = [
        {"$match": match},
        {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}
    ]

    result = list(db.payments.aggregate(pipeline))
    return result[0]["total"] if result else 0

def expenses_by_type(db, start=None, end=None):
    match = {}
    if start and end:
        match["created_at"] = {"$gte": start, "$lt": end}

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$expense_type",
                "total": {"$sum": "$amount"}
            }
        }
    ]

    result = list(db.expenses.aggregate(pipeline))
    return {r["_id"]: r["total"] for r in result}

@router.get("/profit-loss")
def profit_loss(
    year: int,
    month: int,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    start = datetime(year, month, 1, tzinfo=timezone.utc)
    end = (
        datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        if month == 12
        else datetime(year, month + 1, 1, tzinfo=timezone.utc)
    )

    income_pipeline = [
        {"$match": {"created_at": {"$gte": start, "$lt": end}}},
        {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}
    ]

    income_result = list(db.payments.aggregate(income_pipeline))
    income = income_result[0]["total"] if income_result else 0

    expense_pipeline = [
        {"$match": {"created_at": {"$gte": start, "$lt": end}}},
        {"$group": {"_id": "$expense_type", "total": {"$sum": "$amount"}}}
    ]

    expense_result = list(db.expenses.aggregate(expense_pipeline))
    expenses = {e["_id"]: e["total"] for e in expense_result}
    total_expense = sum(expenses.values())

    return {
        "year": year,
        "month": month,
        "income": income,
        "expenses": expenses,
        "total_expense": total_expense,
        "profit": income - total_expense
    }


@router.get("/yearly-trend")
def yearly_trend(
    year: int,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = []

    for month in range(1, 13):
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        end = (
            datetime(year + 1, 1, 1, tzinfo=timezone.utc)
            if month == 12
            else datetime(year, month + 1, 1, tzinfo=timezone.utc)
        )

        # INCOME
        income_pipeline = [
            {"$match": {"created_at": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}
        ]
        income_res = list(db.payments.aggregate(income_pipeline))
        income = income_res[0]["total"] if income_res else 0

        # EXPENSE
        expense_pipeline = [
            {"$match": {"created_at": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        expense_res = list(db.expenses.aggregate(expense_pipeline))
        expense = expense_res[0]["total"] if expense_res else 0

        result.append({
            "month": month,
            "income": income,
            "expense": expense,
            "profit": income - expense
        })

    return {
        "year": year,
        "months": result
    }