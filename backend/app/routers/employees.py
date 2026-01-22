from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.employee import EmployeeCreate
from app.utils.bson import serialize_doc

router = APIRouter(
    prefix="/employees",
    tags=["Employees / Karigars"]
)
@router.post("/")
def add_employee(
    employee: EmployeeCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    doc = employee.dict()
    doc.update({
        "created_at": datetime.utcnow(),
        "is_active": True
    })

    result = db.employees.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return {
        "message": "Employee added successfully",
        "employee": doc
    }
@router.get("/")
def list_employees(
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    employees = db.employees.find({"is_active": True}).sort("created_at", -1)

    return [serialize_doc(emp) for emp in employees]
@router.put("/{employee_id}")
def update_employee(
    employee_id: str,
    employee: EmployeeCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = db.employees.update_one(
        {"_id": ObjectId(employee_id), "is_active": True},
        {"$set": employee.dict()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee updated successfully"}
@router.put("/{employee_id}/pay")
def pay_employee(
    employee_id: str,
    amount: float,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    employee = db.employees.find_one({
        "_id": ObjectId(employee_id),
        "is_active": True
    })

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_advance = employee.get("advance_paid", 0) + amount

    db.employees.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": {"advance_paid": new_advance}}
    )

    return {
        "message": "Payment recorded",
        "total_advance_paid": new_advance
    }
@router.get("/{employee_id}/status")
def employee_salary_status(
    employee_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    emp = db.employees.find_one({
        "_id": ObjectId(employee_id),
        "is_active": True
    })

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    remaining = emp["salary_amount"] - emp.get("advance_paid", 0)

    return {
        "salary_amount": emp["salary_amount"],
        "advance_paid": emp.get("advance_paid", 0),
        "remaining_salary": max(remaining, 0)
    }
@router.delete("/{employee_id}")
def delete_employee(
    employee_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = db.employees.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": {"is_active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee removed"}
