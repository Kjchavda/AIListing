from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Integer, String, Table, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()



# Association Table for Many-to-Many
tool_category_association = Table('tool_category_association', Base.metadata,
    Column('tool_id', Integer, ForeignKey('tools.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)

class Tool(Base):
    __tablename__ = 'tools'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String, nullable=False)
    logo_url = Column(String) # Essential for a visually appealing list
    pricing_type = Column(Enum('free', 'freemium', 'paid', 'contact_us', name='pricing_type_enum'), default='free')
    date_added = Column(DateTime, default=datetime.utcnow)
    is_approved = Column(Boolean, default=False, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    # Relationship to categories
    categories = relationship("Category", secondary=tool_category_association, back_populates="tools")

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    # Relationship to tools
    tools = relationship("Tool", secondary=tool_category_association, back_populates="categories")

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    slug = Column(String(200), unique=True, index=True)
    description = Column(Text)
    graph = Column(JSONB, nullable=False)
    author_id = Column(String(128), nullable=False)
    is_public = Column(Boolean, default=True, index=True)
    likes_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WorkflowLike(Base):
    __tablename__ = "workflow_likes"
    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"))
    user_id = Column(String(128), nullable=False)

class WorkflowSave(Base):
    __tablename__ = "workflow_saves"
    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"))
    user_id = Column(String(128), nullable=False)
