from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routers import auth, tasks, users, chatbot
from app.seed import seed_users

app = FastAPI(
    title="Task Management API",
    description="API untuk aplikasi Task Management sederhana (Technical Test - Moonlay Technologies)",
    version="1.0.0",
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception for internal debugging
    print(f"CRITICAL: Unhandled exception: {type(exc).__name__} - {exc}")
    
    # Return a clean, standardized error response to the client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Terjadi kesalahan internal pada server.",
            "code": "INTERNAL_SERVER_ERROR"
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(chatbot.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Task Management API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
