from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request
import logging

from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.teacher import router as teacher_router
from app.api.student import router as student_router
from app.api.chatbot import router as chatbot_router
from app.models import *
from app.seed import init_demo_data

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="Educational Institute Management backend",
        description="FastAPI backend for an educational institute management system.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "body": exc.body},
        )

    app.include_router(auth_router)
    app.include_router(admin_router)
    app.include_router(teacher_router)
    app.include_router(student_router)
    app.include_router(chatbot_router)

    return app


app = create_app()


@app.on_event("startup")
def startup_event():
    try:
        # Ensure database schema is updated for existing tables first.
        import update_schema
        
        Base.metadata.create_all(bind=engine)
        
        with SessionLocal() as db:
            init_demo_data(db)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed: {str(e)}")
        logger.warning("Application will run but database operations may fail")
        logger.warning("Make sure MySQL server is running on localhost:3306")
