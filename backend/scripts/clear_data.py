import sys
import os

# Appending the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db

def clear_db():
    db = get_db()
    collections_to_clear = [
        "customers",
        "orders",
        "cloth_stock",
        "cloth_usage",
        "payments",
        "expenses",
        "owners",
        "messages"
    ]
    
    print("WARNING: This will delete all data from the following collections:")
    for col in collections_to_clear:
        print(f" - {col}")
    print("Users collection will be preserved.")
    
    # In a real CLI we'd ask for confirmation, but here we assume the user already confirmed via chat.
    print("Starting deletion...")
    
    for col_name in collections_to_clear:
        result = db[col_name].delete_many({})
        print(f"Cleared {col_name}: {result.deleted_count} documents removed.")
        
    print("Done! Database cleared (except Users).")

if __name__ == "__main__":
    clear_db()
