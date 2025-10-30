from pydantic import BaseModel
from typing import Optional, List

class ToolCreate(BaseModel):
    name: str
    description: str
    link: str
    logo_url: Optional[str] = None
    pricing_type: Optional[str] = 'contact_us'
    
class ToolOut(BaseModel):
    id: int
    name:str
    description: str
    link: str
    pricing_type: str