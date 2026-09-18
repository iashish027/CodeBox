from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config.env import get_env


class Base(DeclarativeBase):
    pass


def _database_url() -> str:
    env = get_env()
    if env.DATABASE_URL:
        return env.DATABASE_URL

    if all([env.DB_HOST, env.DB_PORT, env.DB_USER, env.DB_PASSWORD, env.DB_NAME]):
        return (
            f"postgresql://{env.DB_USER}:{env.DB_PASSWORD}"
            f"@{env.DB_HOST}:{env.DB_PORT}/{env.DB_NAME}"
        )

    raise RuntimeError("DATABASE_URL or DB_* environment variables are required")


@lru_cache
def get_engine() -> Engine:
    return create_engine(_database_url(), pool_pre_ping=True)


@lru_cache
def get_session_local() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
