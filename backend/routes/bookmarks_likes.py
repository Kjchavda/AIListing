# file: routers/bookmarks_likes.py
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import FastAPI

from backend.database.database import get_db
from backend.models import Bookmark, Like, Tool, Workflow
from backend.auth import get_current_user
from backend.schemas import BookmarkCreate, BookmarkOut, LikeCreate, LikeOut

router = APIRouter(prefix="", tags=["Bookamrks and Likes"])


@router.post("/bookmarks/", response_model=BookmarkOut, status_code=status.HTTP_201_CREATED)
def create_bookmark(
    payload: BookmarkCreate,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    # validate
    try:
        payload.validate()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check uniqueness (user_id + tool_id + workflow_id)
    existing = (
        db.query(Bookmark)
        .filter_by(user_id=user_id, tool_id=payload.tool_id, workflow_id=payload.workflow_id)
        .first()
    )
    if existing:
        # idempotent: return existing bookmark
        return existing

    # Optionally check referenced tool/workflow exists (recommended)
    if payload.tool_id is not None:
        if not db.query(Tool).filter_by(id=payload.tool_id).first():
            raise HTTPException(status_code=404, detail="Tool not found")
    if payload.workflow_id is not None:
        if not db.query(Workflow).filter_by(id=payload.workflow_id).first():
            raise HTTPException(status_code=404, detail="Workflow not found")

    bookmark = Bookmark(user_id=user_id, tool_id=payload.tool_id, workflow_id=payload.workflow_id)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


@router.get("/bookmarks/", response_model=List[BookmarkOut])
def list_bookmarks(
    tool_id: Optional[int] = None,
    workflow_id: Optional[int] = None,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    q = db.query(Bookmark).filter(Bookmark.user_id == user_id)
    if tool_id is not None:
        q = q.filter(Bookmark.tool_id == tool_id)
    if workflow_id is not None:
        q = q.filter(Bookmark.workflow_id == workflow_id)
    items = q.order_by(Bookmark.created_at.desc()).all()
    return items


@router.get("/bookmarks/check", response_model=dict)
def check_bookmark_exists(
    tool_id: Optional[int] = None,
    workflow_id: Optional[int] = None,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    if (tool_id is None) and (workflow_id is None):
        raise HTTPException(status_code=400, detail="Provide tool_id or workflow_id")
    exists = (
        db.query(Bookmark)
        .filter_by(user_id=user_id, tool_id=tool_id, workflow_id=workflow_id)
        .first()
        is not None
    )
    return {"exists": exists}


@router.delete("/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    bookmark = db.query(Bookmark).filter_by(id=bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if bookmark.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(bookmark)
    db.commit()
    return None


# Optional convenience toggle endpoint
@router.post("/tools/{tool_id}/bookmark", response_model=BookmarkOut)
def toggle_tool_bookmark(
    tool_id: int,
    db: Session = Depends(get_db),                
    user_id: str = Depends(get_current_user),
):
    # if exists -> delete; else -> create
    existing = db.query(Bookmark).filter_by(user_id=user_id, tool_id=tool_id, workflow_id=None).first()
    if existing:
        db.delete(existing)
        db.commit()
        raise HTTPException(status_code=204)  # or return 204 with no content
    # create
    bookmark = Bookmark(user_id=user_id, tool_id=tool_id, workflow_id=None)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


# ---------- Likes: mirrored endpoints ----------
@router.post("/likes/", response_model=LikeOut, status_code=status.HTTP_201_CREATED)
def create_like(
    payload: LikeCreate,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    try:
        payload.validate()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    existing = db.query(Like).filter_by(user_id=user_id, tool_id=payload.tool_id, workflow_id=payload.workflow_id).first()
    if existing:
        return existing

    # Optionally verify referenced object exists
    if payload.tool_id is not None:
        if not db.query(Tool).filter_by(id=payload.tool_id).first():
            raise HTTPException(status_code=404, detail="Tool not found")
    if payload.workflow_id is not None:
        if not db.query(Workflow).filter_by(id=payload.workflow_id).first():
            raise HTTPException(status_code=404, detail="Workflow not found")

    like = Like(user_id=user_id, tool_id=payload.tool_id, workflow_id=payload.workflow_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


@router.get("/likes/", response_model=List[LikeOut])
def list_likes(
    tool_id: Optional[int] = None,
    workflow_id: Optional[int] = None,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    q = db.query(Like).filter(Like.user_id == user_id)
    if tool_id is not None:
        q = q.filter(Like.tool_id == tool_id)
    if workflow_id is not None:
        q = q.filter(Like.workflow_id == workflow_id)
    items = q.order_by(Like.created_at.desc()).all()
    return items


@router.get("/likes/check", response_model=dict)
def check_like_exists(
    tool_id: Optional[int] = None,
    workflow_id: Optional[int] = None,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    if (tool_id is None) and (workflow_id is None):
        raise HTTPException(status_code=400, detail="Provide tool_id or workflow_id")
    exists = db.query(Like).filter_by(user_id=user_id, tool_id=tool_id, workflow_id=workflow_id).first() is not None
    return {"exists": exists}


@router.delete("/likes/{like_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_like(
    like_id: int,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    like = db.query(Like).filter_by(id=like_id).first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    if like.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(like)
    db.commit()
    return None


# Optional convenience toggle endpoint for tool likes
@router.post("/tools/{tool_id}/like", response_model=LikeOut)
def toggle_tool_like(
    tool_id: int,
    db: Session = Depends(get_db),                 
    user_id: str = Depends(get_current_user),
):
    existing = db.query(Like).filter_by(user_id=user_id, tool_id=tool_id, workflow_id=None).first()
    if existing:
        db.delete(existing)
        db.commit()
        raise HTTPException(status_code=204)
    like = Like(user_id=user_id, tool_id=tool_id, workflow_id=None)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like
