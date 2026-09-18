from datetime import datetime, timedelta, timezone
import re

import jwt

from app.config.env import get_env


def _duration_to_timedelta(value: str | None) -> timedelta | None:
    if not value:
        return None

    if value.isdigit():
        return timedelta(seconds=int(value))

    match = re.fullmatch(r"(\d+)(ms|s|m|h|d)", value.strip())
    if not match:
        return None

    amount = int(match.group(1))
    unit = match.group(2)
    if unit == "ms":
        return timedelta(milliseconds=amount)
    if unit == "s":
        return timedelta(seconds=amount)
    if unit == "m":
        return timedelta(minutes=amount)
    if unit == "h":
        return timedelta(hours=amount)
    return timedelta(days=amount)


def generate_access_token(user: dict[str, object]) -> str:
    env = get_env()
    payload: dict[str, object] = {
        "sub": str(user.get("id") or user.get("_id")),
        "role": user.get("role") or "user",
    }

    expires_in = _duration_to_timedelta(env.JWT_EXPIRES_IN)
    if expires_in:
        payload["exp"] = datetime.now(timezone.utc) + expires_in

    return jwt.encode(payload, env.JWT_SECRET or "", algorithm="HS256")
