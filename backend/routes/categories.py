from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models import Category as CategoryModel, Tool as ToolModel
from backend.schemas import Category, CategoryCreate, CategoryUpdate, CategoryWithToolCount
from sqlalchemy import func

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryWithToolCount])
def get_all_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all categories with tool count"""
    categories = db.query(
        CategoryModel,
        func.count(ToolModel.id).label('tool_count')
    ).outerjoin(
        CategoryModel.tools
    ).group_by(
        CategoryModel.id
    ).offset(skip).limit(limit).all()
    
    return [
        CategoryWithToolCount(
            id=cat.id,
            name=cat.name,
            tool_count=count
        )
        for cat, count in categories
    ]

@router.get("/{category_id}", response_model=Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return category

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    # Check if category already exists
    existing = db.query(CategoryModel).filter(CategoryModel.name == category.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' already exists"
        )
    
    db_category = CategoryModel(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update a category"""
    db_category= db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Check for duplicate name if updating
    if category.name:
        existing = db.query(CategoryModel).filter(
            CategoryModel.name == category.name,
            CategoryModel.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category.name}' already exists"
            )
        db_category.name = category.name 
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    db.delete(db_category)
    db.commit()
    return None

@router.get("/{category_id}/tools", response_model=List[dict])
def get_tools_by_category(
    category_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tools in a specific category"""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    tools = db.query(ToolModel).join(
        CategoryModel.tools
    ).filter(
        CategoryModel.id == category_id
    ).offset(skip).limit(limit).all()
    
    return tools