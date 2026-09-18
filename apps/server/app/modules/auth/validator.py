import re

from app.shared.errors.api_error import ApiError
from app.shared.errors.error_codes import ErrorCodes

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SYMBOL_RE = re.compile(r"[^A-Za-z0-9]")


def _is_strong_password(password: str) -> bool:
    return (
        len(password) >= 8
        and any(char.islower() for char in password)
        and any(char.isupper() for char in password)
        and any(char.isdigit() for char in password)
        and bool(SYMBOL_RE.search(password))
    )


def validate_signup(body: dict[str, object]) -> tuple[str, str, str]:
    email = body.get("email")
    password = body.get("password")
    username = body.get("username")

    if not email:
        raise ApiError(400, "EMAIL_REQUIRED", "Email required", "USER")

    if not password:
        raise ApiError(400, "PASSWORD_REQUIRED", "Password required", "USER")

    if not username:
        raise ApiError(400, "USERNAME_REQUIRED", "Username required", "USER")

    if not isinstance(email, str) or not EMAIL_RE.fullmatch(email):
        raise ApiError(400, ErrorCodes.INVALID_INPUT, "Invalid email format", "USER")

    if not isinstance(password, str) or not _is_strong_password(password):
        raise ApiError(
            400,
            ErrorCodes.WEAK_PASSWORD,
            "Password must contain uppercase, lowercase, number and symbol and should be of minimum length 8",
            "USER",
        )

    return email, str(username), password


def validate_signin(body: dict[str, object]) -> tuple[str | None, str | None, str]:
    email = body.get("email")
    username = body.get("username")
    password = body.get("password")

    if not email and not username:
        raise ApiError(400, ErrorCodes.INVALID_INPUT, "Email or username required", "USER")

    if not password:
        raise ApiError(400, "PASSWORD_REQUIRED", "Password required", "USER")

    return (
        str(email) if email else None,
        str(username) if username else None,
        str(password),
    )


def validate_verify_email(username: str | None, token: str | None) -> tuple[str, str]:
    if not username or not token:
        raise ApiError(
            400,
            ErrorCodes.INVALID_INPUT,
            "Username and token are required",
            "USER",
        )

    return username, token


def validate_resend_verification(body: dict[str, object]) -> tuple[str | None, str | None]:
    email = body.get("email")
    username = body.get("username")

    if not email and not username:
        raise ApiError(400, ErrorCodes.INVALID_INPUT, "Email or username required", "USER")

    return str(email) if email else None, str(username) if username else None
