from datetime import datetime, timedelta
import logging

import bcrypt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DbSession

from app.config.env import get_env
from app.models import Session, User
from app.shared.email.email_service import send_verification_mail
from app.shared.errors.api_error import ApiError
from app.shared.errors.error_codes import ErrorCodes
from app.shared.utils.jwt import generate_access_token
from app.shared.utils.token import (
    generate_refresh_token,
    generate_verification_token,
    hash_token,
)

logger = logging.getLogger(__name__)
SALT_ROUNDS = 10


def _hash_password(value: str) -> str:
    return bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt(rounds=SALT_ROUNDS)).decode("utf-8")


def _check_password(value: str, hashed: str) -> bool:
    return bcrypt.checkpw(value.encode("utf-8"), hashed.encode("utf-8"))


def _refresh_expiry_ms() -> int:
    env = get_env()
    try:
        return int(env.JWT_REFRESH_EXPIRES_IN or "0") or 7 * 24 * 60 * 60 * 1000
    except ValueError:
        return 7 * 24 * 60 * 60 * 1000


def signup(db: DbSession, email: str, username: str, password: str) -> dict[str, object]:
    existing_email = db.scalar(select(User).where(User.email == email))
    if existing_email:
        raise ApiError(409, ErrorCodes.EMAIL_EXIST, "An account with this email already exists.")

    existing_username = db.scalar(select(User).where(User.username == username))
    if existing_username:
        raise ApiError(409, ErrorCodes.USERNAME_EXIST, "Username is not available.")

    verification_token = generate_verification_token()
    user = User(
        email=email,
        username=username,
        passwordHash=_hash_password(password),
        isVerified=False,
        verificationToken=hash_token(verification_token),
        tokenExpiry=datetime.utcnow() + timedelta(minutes=15),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as error:
        db.rollback()
        raise ApiError(
            409,
            ErrorCodes.CONFLICT,
            "Unable to create account. Please try again.",
        ) from error

    try:
        send_verification_mail(email, username, verification_token)
    except Exception as error:
        logger.exception("Email sending failed: %s", error)

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "message": "Account created successfully.",
    }


def signin(
    db: DbSession,
    email: str | None,
    username: str | None,
    password: str,
) -> dict[str, object]:
    where_clause = User.email == email if email else User.username == username
    user = db.scalar(select(User).where(where_clause))

    if not user or not _check_password(password, user.passwordHash):
        raise ApiError(
            401,
            ErrorCodes.INVALID_CREDENTIALS,
            "Invalid email/username or password.",
        )

    if not user.isVerified:
        raise ApiError(403, ErrorCodes.ACCOUNT_NOT_VERIFIED, "Account not verified.")

    token = generate_access_token({"id": user.id})
    refresh_token = generate_refresh_token()
    refresh_expiry_ms = _refresh_expiry_ms()
    expires_at = datetime.utcnow() + timedelta(milliseconds=refresh_expiry_ms)

    session = Session(
        userId=user.id,
        refreshHash=_hash_password(refresh_token),
        expiresAt=expires_at,
    )
    db.add(session)
    db.commit()

    return {
        "token": token,
        "refreshToken": refresh_token,
        "refreshExpiryMs": refresh_expiry_ms,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        },
    }


def refresh(db: DbSession, refresh_token: str | None) -> dict[str, object]:
    if not refresh_token:
        raise ApiError(401, ErrorCodes.INVALID_TOKEN, "Refresh token missing.")

    sessions = db.scalars(
        select(Session).where(Session.expiresAt > datetime.utcnow()).join(Session.user)
    ).all()

    matched_session = None
    for session in sessions:
        if _check_password(refresh_token, session.refreshHash):
            matched_session = session
            break

    if not matched_session:
        raise ApiError(
            401,
            ErrorCodes.INVALID_TOKEN,
            "Invalid or expired refresh token.",
        )

    token = generate_access_token({"id": matched_session.userId})
    new_refresh_token = generate_refresh_token()
    refresh_expiry_ms = _refresh_expiry_ms()

    matched_session.refreshHash = _hash_password(new_refresh_token)
    matched_session.expiresAt = datetime.utcnow() + timedelta(milliseconds=refresh_expiry_ms)
    db.commit()
    db.refresh(matched_session)

    return {
        "token": token,
        "refreshToken": new_refresh_token,
        "refreshExpiryMs": refresh_expiry_ms,
        "user": {
            "id": matched_session.user.id,
            "email": matched_session.user.email,
            "username": matched_session.user.username,
        },
    }


def verify_email(db: DbSession, username: str, token: str) -> dict[str, str]:
    user = db.scalar(select(User).where(User.username == username))
    invalid = ApiError(400, ErrorCodes.INVALID_TOKEN, "Invalid verification token or user.")

    if not user or user.isVerified or not user.verificationToken or not user.tokenExpiry:
        raise invalid

    if user.tokenExpiry < datetime.utcnow():
        raise invalid

    if hash_token(token) != user.verificationToken:
        raise invalid

    user.isVerified = True
    user.verificationToken = None
    user.tokenExpiry = datetime.utcnow()
    db.commit()

    return {"message": "Email verified successfully."}


def resend_verification(
    db: DbSession,
    email: str | None,
    username: str | None,
) -> dict[str, str]:
    where_clause = User.email == email if email else User.username == username
    user = db.scalar(select(User).where(where_clause))

    if not user or user.isVerified:
        raise ApiError(400, ErrorCodes.INVALID_TOKEN, "Invalid verification token or user.")

    verification_token = generate_verification_token()
    user.verificationToken = hash_token(verification_token)
    user.tokenExpiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    try:
        send_verification_mail(user.email, user.username, verification_token)
    except Exception as error:
        logger.exception("Resend email failed: %s", error)

    return {"message": "Verification email sent."}
