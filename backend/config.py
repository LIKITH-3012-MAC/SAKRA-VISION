from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "SAKRA VISION Backend"
    
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    SECRET_TOKEN: str = "shivayya"
    
    DB_HOST: str
    DB_PORT: int = 3306
    DB_NAME: str = "defaultdb"
    DB_USER: str
    DB_PASSWORD: str
    DB_SSL_CA: str = ""
    
    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "Likith Naidu <noreply@mail.sakra-vision.online>"
    RESEND_TO_EMAIL: str = "likith.anumakonda@gmail.com"
    
    TRUST_PROXY: bool = False
    CLOUDFLARE_API_TOKEN: str = ""
    CLOUDFLARE_ZONE_ID: str = ""
    TURNSTILE_SECRET_KEY: str = ""
    RATE_LIMIT_CLIENTS: str = "30/minute"
    RATE_LIMIT_CHAT: str = "30/minute"

    # Load from .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
