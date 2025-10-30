from database.database import SessionLocal, engine
from models import Base, Tool, Category, tool_category_association

def clear_database():
    """Clear all data from the database"""
    print("⚠️  WARNING: This will delete all data from the database!")
    confirm = input("Type 'yes' to confirm: ")
    
    if confirm.lower() != 'yes':
        print("❌ Aborted.")
        return
    
    db = SessionLocal()
    
    try:
        # Delete in correct order: association table first, then main tables
        print("Deleting tool-category associations...")
        db.execute(tool_category_association.delete())
        
        print("Deleting tools...")
        db.query(Tool).delete()
        
        print("Deleting categories...")
        db.query(Category).delete()
        
        db.commit()
        
        print("\n✓ Database cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_database()