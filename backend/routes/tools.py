from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List


from backend.database.database import SessionLocal
from backend import models
from backend.schemas import ToolCreate, ToolOut


router = APIRouter(prefix="/tools", tags=["Tools"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Get all tools
@router.get("/", response_model=List[ToolOut])
def get_all_tools(db: Session = Depends(get_db)):
    tools = db.query(models.Tool).all()
    return tools


# Get tool by ID
@router.get("/{tool_id}", response_model=ToolOut)
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


# Create new tool
@router.post("/", response_model=ToolOut)
def create_tool(tool_data: ToolCreate, db: Session = Depends(get_db)):
    new_tool = models.Tool(**dict(tool_data.model_dump()))
    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)
    return new_tool


# Update tool
@router.put("/{tool_id}", response_model=ToolOut)
def update_tool(tool_id: int, updated_data: dict, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    for key, value in updated_data.items():
        setattr(tool, key, value)

    db.commit()
    db.refresh(tool)
    return tool


# Delete tool
@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    db.delete(tool)
    db.commit()
    return {"message": f"Tool '{tool.name}' deleted successfully"}
