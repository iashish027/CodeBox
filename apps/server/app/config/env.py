from functools import lru_cache
import os
from pathlib import Path

from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = SERVER_DIR.parents[1]
NODE_SERVER_DIR = ROOT_DIR / "apps" / "server"

load_dotenv()
load_dotenv(SERVER_DIR / ".env", override=False)
load_dotenv(NODE_SERVER_DIR / ".env", override=False)
load_dotenv(ROOT_DIR / ".env", override=False)


class Env:
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    SERVER_PORT = os.getenv("SERVER_PORT")
    DATABASE_URL = os.getenv("DATABASE_URL")

    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = os.getenv("SMTP_PORT")
    SMTP_SECURE = os.getenv("SMTP_SECURE") == "true"
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")

    FRONTEND_URL = os.getenv("FRONTEND_URL")
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN")
    JWT_REFRESH_EXPIRES_IN = os.getenv("JWT_REFRESH_EXPIRES_IN")
    NODE_ENV = os.getenv("NODE_ENV")


@lru_cache
def get_env() -> Env:
    return Env()
