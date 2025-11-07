from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.auth import get_current_user
from backend.database.database import get_db
from backend.models import Tool as ToolModel, Category as CategoryModel
from backend.schemas import ToolBase

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/pending-tools", response_model=List[ToolBase])
def get_pending_tools(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(10, le=100),
    current_user: str = Depends(get_current_user)
):
    """Retrieve a list of tools pending approval"""
    pending_tools = db.query(ToolModel).filter(ToolModel.is_approved == False).offset(skip).limit(limit).all()
    if not pending_tools:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No pending tools found")
    
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access")
    
    return pending_tools