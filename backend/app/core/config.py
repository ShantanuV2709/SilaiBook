from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    DB_NAME: str
    silaibook_secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
