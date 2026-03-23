from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum

class PricingType(str, Enum):
    free = "free"
    freemium = "freemium"
    paid = "paid"
    contact_us = "contact_us"

# Category Schemas
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

class CategoryWithToolCount(Category):
    tool_count: int = 0

# Tool Schemas
class ToolBase(BaseModel):
    name: str
    description: str
    link: str
    logo_url: Optional[str] = None
    pricing_type: PricingType = PricingType.free
    is_approved: Optional[bool] = False
    user_id: Optional[str] = None  # ID of the user who added the tool

class ToolCreate(BaseModel):
    name: str
    description: str
    link: HttpUrl
    logo_url: Optional[str] = None
    pricing_type: PricingType = PricingType.free
    category_ids: List[int]
    # handled by backend
    is_approved: Optional[bool] = False
    user_id: Optional[str] = None

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    logo_url: Optional[str] = None
    pricing_type: Optional[PricingType] = None
    category_ids: Optional[List[int]] = None  # Add category IDs

class Tool(ToolBase):
    id: int
    date_added: datetime
    categories: List[Category] = []  # Include categories in response
    
    class Config:
        from_attributes = True

class ToolWithCategories(Tool):
    pass  # Alias for clarity

class CompareRequest(BaseModel):
    ids: List[int] = Field(..., description="List of tool IDs to compare")


# Workflow Schemas
class Graph(BaseModel):
    nodes: List[Dict[str, Any]] = Field(..., description="React Flow nodes array")
    edges: List[Dict[str, Any]] = Field(..., description="React Flow edges array")

    model_config = {"extra": "allow"}


class WorkflowCreate(BaseModel):
    title: str = Field(..., max_length=150)
    description: Optional[str] = None
    graph: Graph
    is_public: bool = True

    model_config = {"extra": "ignore"}


class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    graph: Optional[Graph] = None
    is_public: Optional[bool] = None

    model_config = {"extra": "ignore"}


class WorkflowRead(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    graph: Graph
    author_id: str
    is_public: bool
    likes_count: int = 0
    saves_count: int = 0
    thumbnail_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # allow reading directly from SQLAlchemy objects
    model_config = {"from_attributes": True, "extra": "ignore"}

# Bookmark Schemas
class BookmarkCreate(BaseModel):
    tool_id: Optional[int] = None
    workflow_id: Optional[int] = None

    def validate(self):
        if (self.tool_id is None) and (self.workflow_id is None):
            raise ValueError("Either tool_id or workflow_id must be provided.")
        if (self.tool_id is not None) and (self.workflow_id is not None):
            raise ValueError("Provide only one of tool_id or workflow_id.")


class BookmarkOut(BaseModel):
    id: int
    user_id: str
    tool_id: Optional[int]
    workflow_id: Optional[int]
    created_at: Optional[datetime]  # ISO str

    class Config:
        orm_mode = True


class LikeCreate(BaseModel):
    tool_id: Optional[int] = None
    workflow_id: Optional[int] = None

    def validate(self):
        if (self.tool_id is None) and (self.workflow_id is None):
            raise ValueError("Either tool_id or workflow_id must be provided.")
        if (self.tool_id is not None) and (self.workflow_id is not None):
            raise ValueError("Provide only one of tool_id or workflow_id.")


class LikeOut(BaseModel):
    id: int
    user_id: str
    tool_id: Optional[int]
    workflow_id: Optional[int]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

