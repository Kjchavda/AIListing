from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Integer, String, Table, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
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
    # Relationship to categories
    categories = relationship("Category", secondary=tool_category_association, back_populates="tools")

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    # Relationship to tools
    tools = relationship("Tool", secondary=tool_category_association, back_populates="categories")