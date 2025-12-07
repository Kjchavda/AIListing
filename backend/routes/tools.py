from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.database import get_db
from backend.models import Tool as ToolModel, Category as CategoryModel
from backend.schemas import CompareRequest, Tool, ToolCreate, ToolUpdate, PricingType
from backend.auth import get_current_user


router = APIRouter(prefix="/tools", tags=["tools"])

@router.get("/", response_model=List[Tool])
def get_all_tools(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    pricing_type: Optional[PricingType] = Query(None, description="Filter by pricing type"),
    search: Optional[str] = Query(None, description="Search in name or description"),
    db: Session = Depends(get_db)
):
    """
    Get all tools with optional filters:
    - category_id: Filter by specific category
    - pricing_type: Filter by pricing type (free, freemium, paid, contact_us)
    - search: Search in tool name or description
    """
    query = db.query(ToolModel)
    
    # Filter by category
    if category_id:
        query = query.join(ToolModel.categories).filter(CategoryModel.id == category_id)
    
    # Filter by pricing type
    if pricing_type:
        query = query.filter(ToolModel.pricing_type == pricing_type)
    
    # Search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ToolModel.name.ilike(search_filter)) | 
            (ToolModel.description.ilike(search_filter))
        )
    
    tools = query.offset(skip).limit(limit).all()
    return tools

@router.get("/{tool_id}", response_model=Tool)
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    """Get a specific tool by ID"""
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    return tool

@router.post("/", response_model=Tool, status_code=status.HTTP_201_CREATED)
def create_tool(tool: ToolCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Create a new tool with categories"""
    # Check if tool already exists
    existing = db.query(ToolModel).filter(ToolModel.name == tool.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tool '{tool.name}' already exists"
        )
    
    # Verify all category IDs exist
    if tool.category_ids:
        categories = db.query(CategoryModel).filter(
            CategoryModel.id.in_(tool.category_ids)
        ).all()
        
        if len(categories) != len(tool.category_ids):
            found_ids = {cat.id for cat in categories}
            missing_ids = set(tool.category_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categories with IDs {missing_ids} not found"
            )
    else:
        categories = []
    
    # Create tool without category_ids field
    tool_data = tool.model_dump(exclude={'category_ids', 'user_id'})

    tool_data["user_id"] = current_user

    tool_data["link"] = str(tool_data["link"])
    
    db_tool = ToolModel(**tool_data)
    
    # Associate categories
    db_tool.categories = categories
    
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool

@router.put("/{tool_id}", response_model=Tool)
def update_tool(
    tool_id: int,
    tool: ToolUpdate,
    db: Session = Depends(get_db)
):
    """Update a tool"""
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not db_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    # Check for duplicate name if updating
    if tool.name:
        existing = db.query(ToolModel).filter(
            ToolModel.name == tool.name,
            ToolModel.id != tool_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tool '{tool.name}' already exists"
            )
    
    # Update categories if provided
    if tool.category_ids is not None:
        categories = db.query(CategoryModel).filter(
            CategoryModel.id.in_(tool.category_ids)
        ).all()
        
        if len(categories) != len(tool.category_ids):
            found_ids = {cat.id for cat in categories}
            missing_ids = set(tool.category_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categories with IDs {missing_ids} not found"
            )
        
        db_tool.categories = categories
    
    # Update other fields
    update_data = tool.dict(exclude_unset=True, exclude={'category_ids'})
    for field, value in update_data.items():
        setattr(db_tool, field, value)
    
    db.commit()
    db.refresh(db_tool)
    return db_tool

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    """Delete a tool"""
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not db_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    db.delete(db_tool)
    db.commit()
    return None

@router.post("/{tool_id}/categories/{category_id}", response_model=Tool)
def add_category_to_tool(
    tool_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    """Add a category to a tool"""
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    if category in tool.categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' already assigned to tool '{tool.name}'"
        )
    
    tool.categories.append(category)
    db.commit()
    db.refresh(tool)
    return tool

@router.delete("/{tool_id}/categories/{category_id}", response_model=Tool)
def remove_category_from_tool(
    tool_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    """Remove a category from a tool"""
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    if category not in tool.categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' not assigned to tool '{tool.name}'"
        )
    
    tool.categories.remove(category)
    db.commit()
    db.refresh(tool)
    return tool

@router.post("/compare", response_model=List[Tool])
def compare_tools(req: CompareRequest, db: Session = Depends(get_db)):
    if not req.ids:
        raise HTTPException(status_code=400, detail="ids list cannot be empty")

    # fetch tools matching the provided IDs
    tools = (
        db.query(ToolModel)
        .filter(ToolModel.id.in_(req.ids))
        # If you have an approval field, keep the line below; otherwise remove it.
        # .filter(ToolModel.is_approved.is_(True))
        .all()
    )

    # optional: preserve order of returned tools to match input ordering
    if tools:
        tools_by_id = {t.id: t for t in tools}
        ordered_tools = [tools_by_id[i] for i in req.ids if i in tools_by_id]
    else:
        ordered_tools = []

    return ordered_tools