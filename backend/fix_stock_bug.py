import pymongo
from bson import ObjectId

# Direct connection to avoid app dependency issues
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "SilaiBook"

def fix_stock():
    print("🔄 Connecting to MongoDB...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("🔄 Starting Stock Correction...")
    
    # 1. Reset all stocks logic
    stocks = db.cloth_stock.find({"is_active": True})
    
    updated_count = 0
    
    for stock in stocks:
        stock_id = stock["_id"]
        total = stock.get("total_meters", 0)
        remaining = stock.get("remaining_meters", 0)
        
        # Consumed = What is permanently gone (Total - Remaining)
        consumed = total - remaining
        
        # Reserved = What is in active orders (Received, Cutting, Stitching, Finishing)
        # NOT Ready or Delivered (because Ready/Delivered have already decremented remaining)
        active_orders = db.orders.find({
            "status": {"$in": ["Received", "Cutting", "Stitching", "Finishing"]},
            "cloth_used.cloth_stock_id": stock_id,
            "is_active": True
        })
        
        reserved = 0
        for order in active_orders:
            for item in order.get("cloth_used", []):
                # Handle both ObjectId and string comparison
                if str(item.get("cloth_stock_id")) == str(stock_id):
                    reserved += float(item.get("meters_used", 0))
                    
        # Correct Used Value
        correct_used = consumed + reserved
        
        # Update
        db.cloth_stock.update_one(
            {"_id": stock_id},
            {"$set": {"used_meters": correct_used}}
        )
        
        print(f"✅ Fixed Stock {stock.get('cloth_type', 'Unknown')}: Total={total}, Rem={remaining}, Active_Rsrv={reserved} => New Used={correct_used}")
        updated_count += 1
        
    print(f"🎉 Correction Complete! Updated {updated_count} stocks.")

if __name__ == "__main__":
    fix_stock()
