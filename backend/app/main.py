from fastapi import FastAPI
from .routers import cv, auth, chat
from .db import engine, Base
from . import models
from fastapi.middleware.cors import CORSMiddleware
import logging
logging.basicConfig(level=logging.INFO)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 1) Enable CORS for your React origin (http://localhost:8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],     # allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],     # allows Content-Type, Authorization, etc.
)

app.include_router(auth.router, prefix="/auth")
app.include_router(cv.router)
app.include_router(chat.router, prefix="/api")
