from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text
from db.config import create_tables, SessionLocal
import uvicorn
from reg import router as register_router
from signin import router as signin_router
from profile import router as profile_router
from donation_process import router as donation_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield
app = FastAPI(
    title="CharityChain API",
    description="API для блокчейн-платформы благотворительности",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(register_router, tags=["Authentication"])
app.include_router(signin_router, tags=["Authentication"])
app.include_router(profile_router, tags=["Profile"])
app.include_router(donation_router, tags=["Donation"])
@app.get("/")
async def root():
    return {
        "message": "CharityChain API is running",
        "version": "1.0.0"
    }
@app.get("/health")
async def health_check():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
