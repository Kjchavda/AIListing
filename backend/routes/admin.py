from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.auth import get_current_user
from backend.database.database import get_db
from backend.models import Tool as ToolModel
from backend.schemas import Tool, ToolBase

router = APIRouter(prefix="/admin", tags=["admin"])

# --- CONFIGURATION ---
ADMIN_USER_ID = "user_358uhfB0Qi2yobJpykzod0H7SaK" 

# --- ADMIN CHECK DEPENDENCY ---
def require_admin(user_id: str = Depends(get_current_user)):
    """
    Dependency that ensures the user is logged in AND is the specific admin.
    """
    if user_id != ADMIN_USER_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You are not authorized to perform admin actions"
        )
    return user_id

# --- ROUTES ---

@router.get("/pending-tools", response_model=List[Tool])
def get_pending_tools(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(10, le=100),
    admin_id: str = Depends(require_admin) # Fixed: Now only admin can view this
):
    """Retrieve a list of tools pending approval"""
    pending_tools = db.query(ToolModel).filter(ToolModel.is_approved == False).offset(skip).limit(limit).all()
    
    # Fixed: Removed the 404 error if the list is empty. 
    # Returning an empty list [] is the correct RESTful behavior.
    return pending_tools

@router.post("/tools/{tool_id}/approve", response_model=ToolBase)
def approve_tool(tool_id: int, db: Session = Depends(get_db), admin_id: str = Depends(require_admin)):
    """
    Approve a tool. Changes is_approved to True.
    """
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool.is_approved = True
    db.commit()
    db.refresh(tool)
    return tool

@router.delete("/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def reject_tool(tool_id: int, db: Session = Depends(get_db), admin_id: str = Depends(require_admin)):
    """
    Reject a tool. Deletes it from the database.
    """
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    db.delete(tool)
    db.commit()
    return None