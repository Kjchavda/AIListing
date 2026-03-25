import json
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine
from backend.models import Base
from backend.models import Tool, Category
from backend.schemas import PricingType

load_dotenv()

ADMIN_USER_ID = os.getenv("ADMIN_USER_ID")

def import_tools(json_filepath: str):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        with open(json_filepath, 'r') as file:
            tools_data = json.load(file)

        success_count = 0
        for tool in tools_data:
            # Check if tool already exists
            if db.query(Tool).filter(Tool.name == tool['name']).first():
                print(f"Tool '{tool['name']}' already exists. Skipping.")
                continue

            # ---> THIS ENTIRE BLOCK MUST BE INDENTED INSIDE THE FOR LOOP <---
            
            # Handle categories
            db_categories = []
            for category_name in tool.get('categories', []):
                category = db.query(Category).filter(Category.name == category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.add(category)
                    db.commit()
                    db.refresh(category)
                db_categories.append(category)

            # Create new tool
            new_tool = Tool(
                name = tool['name'],
                description = tool['description'],
                link = tool['link'],
                logo_url = tool.get('logo_url', ''),
                # Default to free if parsing fails.
                pricing_type = tool.get('pricing_type', PricingType.free.value),
                is_approved = True, # Directly approve scraped tools
                user_id = ADMIN_USER_ID,
                categories = db_categories
            ) 

            db.add(new_tool)
            success_count += 1
            # ----------------------------------------------------------------
            
        # Commit all the new tools at the very end
        db.commit()
        print(f"✅ Successfully imported {success_count} tools into the database!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during import: {str(e)}")
    
    finally:
        db.close()

if __name__ == "__main__":
    import_tools("scraper/data/scraped_tools.json")