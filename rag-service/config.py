"""
Configuration module for RAG Service
Loads environment variables and provides centralized config access
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Centralized configuration class for RAG service"""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # AI Provider: "openai", "gemini", or "groq"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # RAG Configuration
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", 600))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", 100))
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", 4))
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
    # File paths
    UPLOADS_BASE_PATH: str = os.getenv(
        "UPLOADS_BASE_PATH", 
        "/Users/sravankumarega/Desktop/Feature_project/google-drive-clone/backend/uploads"
    )
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        if cls.AI_PROVIDER == "openai" and not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when using OpenAI provider")
        if cls.AI_PROVIDER == "gemini" and not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required when using Gemini provider")
        if cls.AI_PROVIDER == "groq" and not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required when using Groq provider")
        return True


# Create singleton config instance
config = Config()
