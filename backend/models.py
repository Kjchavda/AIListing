from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Integer, String, Table, Text, Boolean, TIMESTAMP, ForeignKey, UniqueConstraint
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

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)   # Store Clerk ID directly
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "tool_id", name="uq_bookmark"),
    )

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)   # Store Clerk ID directly
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "tool_id", name="uq_like"),
    )