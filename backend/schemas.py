from pydantic import BaseModel, HttpUrl
from typing import Optional, List
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