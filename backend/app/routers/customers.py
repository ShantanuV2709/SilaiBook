from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from datetime import datetime
import shutil
import os
import uuid

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.customer import CustomerCreate
from app.utils.bson import serialize_doc

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.post("/")
def add_customer(
    customer: CustomerCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    # Prevent duplicate mobile numbers
    if db.customers.find_one({"mobile": customer.mobile}):
        raise HTTPException(status_code=400, detail="Customer already exists")

    doc = customer.dict()
    doc.update({
        "created_at": datetime.utcnow(),
        "is_active": True
    })

    result = db.customers.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return {
        "message": "Customer added successfully",
        "customer": doc
    }

@router.post("/upload-photo")
def upload_photo(file: UploadFile = File(...)):
    try:
        # Create unique filename
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = f"app/static/photos/{filename}"
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"http://localhost:8000/static/photos/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_customers(
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    query = {"is_active": True}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"mobile": {"$regex": search}}
        ]

    customers = db.customers.find(query).sort("created_at", -1)

    return [
        serialize_doc(customer)
        for customer in customers
    ]
@router.put("/{customer_id}")
def update_customer(
    customer_id: str,
    customer: CustomerCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = db.customers.update_one(
        {"_id": __import__("bson").ObjectId(customer_id), "is_active": True},
        {"$set": customer.dict()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {"message": "Customer updated successfully"}

@router.get("/customer-count")
def customer_count():
    db=get_db()
    count = db.customers.count_documents({})
    return {
        "count": count
    }

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    result = db.customers.update_one(
        {"_id": __import__("bson").ObjectId(customer_id)},
        {"$set": {"is_active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {"message": "Customer deleted successfully"}

