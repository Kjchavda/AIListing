from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend import models

router = APIRouter(prefix="/tools", tags=["Tools"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ 1. Get all tools
@router.get("/")
def get_all_tools(db: Session = Depends(get_db)):
    tools = db.query(models.Tool).all()
    return tools


# ✅ 2. Get tool by ID
@router.get("/{tool_id}")
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


# ✅ 3. Create new tool
@router.post("/")
def create_tool(tool_data: dict, db: Session = Depends(get_db)):
    new_tool = models.Tool(**tool_data)
    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)
    return new_tool


# ✅ 4. Update tool
@router.put("/{tool_id}")
def update_tool(tool_id: int, updated_data: dict, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    for key, value in updated_data.items():
        setattr(tool, key, value)

    db.commit()
    db.refresh(tool)
    return tool


# ✅ 5. Delete tool
@router.delete("/{tool_id}")
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    db.delete(tool)
    db.commit()
    return {"message": f"Tool '{tool.name}' deleted successfully"}
