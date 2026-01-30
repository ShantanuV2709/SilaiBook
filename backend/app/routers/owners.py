from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.owner import OwnerCreate, OwnerUpdate, OwnerOut
from app.utils.bson import serialize_doc
from bson import ObjectId

router = APIRouter(
    prefix="/owners",
    tags=["Owners & Partners"]
)

@router.post("/", response_model=dict)
def create_owner(
    owner: OwnerCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Check if name exists
    if db.owners.find_one({"name": owner.name, "is_active": True}):
        raise HTTPException(status_code=400, detail="Owner with this name already exists")

    new_owner = owner.dict()
    new_owner.update({
        "created_at": datetime.utcnow(),
        "is_active": True,
        "total_withdrawn": 0.0,
        "created_by": current_user.get("username")
    })

    if not new_owner.get("joined_date"):
        new_owner["joined_date"] = datetime.utcnow()

    res = db.owners.insert_one(new_owner)
    
    return {
        "message": "Partner profile created successfully",
        "id": str(res.inserted_id)
    }

@router.get("/", response_model=List[dict])
def list_owners(current_user: dict = Depends(get_current_user)):
    db = get_db()
    owners = list(db.owners.find({"is_active": True}).sort("created_at", -1))
    return [serialize_doc(o) for o in owners]

@router.get("/{owner_id}", response_model=dict)
def get_owner(owner_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    owner = db.owners.find_one({"_id": ObjectId(owner_id)})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return serialize_doc(owner)

@router.put("/{owner_id}")
def update_owner(
    owner_id: str,
    update_data: OwnerUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    data = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    data["updated_at"] = datetime.utcnow()
    
    res = db.owners.update_one(
        {"_id": ObjectId(owner_id)},
        {"$set": data}
    )
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Owner not found")
        
    return {"message": "Owner profile updated"}

@router.delete("/{owner_id}")
def delete_owner(owner_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    # Soft delete
    res = db.owners.update_one(
        {"_id": ObjectId(owner_id)},
        {"$set": {"is_active": False}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Owner not found")
    return {"message": "Owner profile deactivated"}

# WITHDRAWAL / EXPENSE TRACKING
# This endpoint allows recording a personal withdrawal or expense against an owner
@router.post("/{owner_id}/withdraw")
def record_withdrawal(
    owner_id: str,
    amount: float = Body(..., embed=True),
    note: str = Body("", embed=True),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    owner = db.owners.find_one({"_id": ObjectId(owner_id)})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
        
    # 1. Update owner's total withdrawn
    db.owners.update_one(
        {"_id": ObjectId(owner_id)},
        {"$inc": {"total_withdrawn": amount}}
    )
    
    # 2. Record as an expense in the main expenses table too?
    # Usually partner withdrawal is an 'Equity' transaction, not strictly a business 'Expense' for P&L, 
    # but for simple shops, it's often treated as an expense or just cash out.
    # Let's record it in a separate 'withdrawals' collection or just add to expenses with a special tag.
    # Approach for now: Record in 'expenses' collection with type 'Withdrawal' linked to owner.
    
    withdrawal_doc = {
        "description": f"Withdrawal by {owner['name']}: {note}",
        "amount": amount,
        "category": "Salary/Drawings",
        "expense_type": "Withdrawal",
        "owner_id": ObjectId(owner_id),
        "owner_name": owner['name'],
        "created_at": datetime.utcnow(),
        "created_by": current_user.get("username")
    }
    
    db.expenses.insert_one(withdrawal_doc)
    
    return {"message": "Withdrawal recorded successfully", "new_total": owner.get("total_withdrawn", 0) + amount}


# DEPOSIT / PAYBACK
# This allows a partner to return money to the business
@router.post("/{owner_id}/deposit")
def record_deposit(
    owner_id: str,
    amount: float = Body(..., embed=True),
    note: str = Body("", embed=True),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    owner = db.owners.find_one({"_id": ObjectId(owner_id)})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
        
    # 1. Decrease owner's total withdrawn
    db.owners.update_one(
        {"_id": ObjectId(owner_id)},
        {"$inc": {"total_withdrawn": -amount}}
    )
    
    # 2. Record this as a 'Deposit' (Entry in expenses for record keeping, but positive flow)
    # in a real accounting system this would be different, but here we just track flow.
    deposit_doc = {
        "description": f"Deposit by {owner['name']}: {note}",
        "amount": amount, 
        "category": "Salary/Drawings",
        "expense_type": "Deposit",  # Distinct type
        "owner_id": ObjectId(owner_id),
        "owner_name": owner['name'],
        "created_at": datetime.utcnow(),
        "created_by": current_user.get("username")
    }
    
    db.expenses.insert_one(deposit_doc)
    
    return {"message": "Deposit recorded successfully", "new_total": owner.get("total_withdrawn", 0) - amount}
