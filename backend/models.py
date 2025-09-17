from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    tools = relationship("Tool", back_populates="category")

class Tool(Base):
    __tablename__ = 'tools'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String(255), nullable=False)
    is_free = Column(Boolean, default=True)
    date_added = Column(TIMESTAMP, server_default=func.now())
    category_id = Column(Integer, ForeignKey('categories.id'))
    category = relationship("Category", back_populates="tools")