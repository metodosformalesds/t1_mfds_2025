import os
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()   

class Settings(BaseSettings):
    # Application
    # Database
    DATABASE_URL: str
    
    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # AWS Cognito
    COGNITO_USER_POOL_ID: str
    COGNITO_CLIENT_ID: str
    COGNITO_REGION: str
    
    # AWS S3
    S3_BUCKET_NAME: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Stripe
    STRIPE_API_KEY: str
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # PayPal
    PAYPAL_CLIENT_ID: str
    PAYPAL_CLIENT_SECRET: str
    PAYPAL_API_BASE_URL: str 
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# debug
print("Cognito Region:", os.getenv("COGNITO_REGION"))
print("AWS Region:", os.getenv("AWS_REGION"))
print("COGNITO_CLIENT_ID:", os.getenv("COGNITO_CLIENT_ID"))
print("User Pool ID:", os.getenv("COGNITO_USER_POOL_ID"))
print("Client ID:", os.getenv("COGNITO_CLIENT_ID"))
print("Database URL:", os.getenv("DATABASE_URL"))
print("S3 Bucket Name:", os.getenv("S3_BUCKET_NAME"))
print("Stripe API Key:", os.getenv("STRIPE_API_KEY"))
print("PayPal Client ID:", os.getenv("PAYPAL_CLIENT_ID"))
print("AWS Access Key ID:", os.getenv("aWS_ACCESS_KEY_ID"))