# data-science-service/app/core/config.py
import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    # Model configuration for pydantic_settings
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore' # Ignore extra fields not defined here
    )

    PROJECT_NAME: str = "Wellness AI Data Science Service"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(..., env="AI_SERVICE_SECRET_KEY") # Use an environment variable for secret key

    # CORS origins for your frontend. Add your frontend's URL here.
    # For development, you might use ["*"] or specific localhost URLs.
    # In production, specify your Vercel frontend URL.
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # Frontend dev server
        "http://localhost:5173",  # Frontend Vite dev server
        # Add your production frontend URL here, e.g., "https://your-wellness-app.vercel.app"
    ]

    # Model paths - replace with actual paths to your trained models
    NLP_MODEL_PATH: str = "./models/nlp_sentiment_model.pkl" # Example path for NLP model
    OCR_MODEL_PATH: str = "./models/ocr_meal_recognition_model.pth" # Example path for OCR model
    POSE_DETECTION_MODEL_PATH: str = "./models/pose_estimation_model.pth" # Example path for Pose Detection model
    LLM_MODEL_PATH: str = "./models/ai_coach_llm_model.pth" # Example path for AI Coach LLM

    # Example: Redis configuration (if directly interacting from DS service)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

settings = Settings()
