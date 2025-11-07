from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Dict, Any
from sqlalchemy import text
import os

from backend.routes.tools import router as tool_router
from backend.routes.categories import router as category_router
from backend.routes.admin import router as admin_router


from .database.database import engine
from .models import Base  

Base.metadata.create_all(bind=engine)

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Add initialization code here
    print("Starting up...")
    yield
    # Shutdown: Add cleanup code here
    print("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="AIListing API",
    description="Backend API for AIListing application",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(tool_router)
app.include_router(category_router)
app.include_router(admin_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint with basic API information"""

    return {
        "message": "Welcome to AIListing API",
        "status": "running",
        "version": app.version
    }

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "healthy",
        "db_status": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENV", "development"),
        "version": app.version
    }


# app.include_router(some_router, prefix="/api/v1")