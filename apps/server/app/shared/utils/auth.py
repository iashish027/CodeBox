import jwt
from fastapi import Cookie

from app.config.env import get_env
from app.shared.errors.api_error import ApiError


def verify_access_token(access_token: str | None = Cookie(default=None)) -> dict[str, object]:
    if not access_token:
        raise ApiError(401, "AUTH_INVALID", "Access token missing", "USER")

    try:
        return jwt.decode(access_token, get_env().JWT_SECRET or "", algorithms=["HS256"])
    except jwt.PyJWTError as error:
        raise ApiError(401, "AUTH_EXPIRED", "Invalid or expired token", "USER") from error
