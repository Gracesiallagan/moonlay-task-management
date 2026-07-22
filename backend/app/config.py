from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/task_management"

    jwt_secret_key: str = "change-this-to-a-long-random-secret-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    frontend_origin: str = "http://localhost:3000"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
