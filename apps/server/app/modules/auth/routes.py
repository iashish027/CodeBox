from typing import Any

from fastapi import APIRouter, Body, Cookie, Depends, Query, Response
from sqlalchemy.orm import Session as DbSession

from app.config.database import get_db
from app.config.env import get_env
from app.modules.auth import services
from app.modules.auth.validator import (
    validate_resend_verification,
    validate_signin,
    validate_signup,
    validate_verify_email,
)

router = APIRouter()


def _set_refresh_cookie(response: Response, refresh_token: str, refresh_expiry_ms: int) -> None:
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=get_env().NODE_ENV == "production",
        samesite="strict",
        max_age=refresh_expiry_ms // 1000,
    )


@router.post("/signup", status_code=201)
def signup(
    body: dict[str, Any] = Body(default_factory=dict),
    db: DbSession = Depends(get_db),
) -> dict[str, object]:
    email, username, password = validate_signup(body)
    return services.signup(db, email, username, password)


@router.post("/signin")
def signin(
    response: Response,
    body: dict[str, Any] = Body(default_factory=dict),
    db: DbSession = Depends(get_db),
) -> dict[str, object]: 
    email, username, password = validate_signin(body)
    result = services.signin(db, email, username, password)
    _set_refresh_cookie(response, str(result["refreshToken"]), int(result["refreshExpiryMs"]))

    return {
        "token": result["token"],
        "user": result["user"],
    }


@router.post("/refresh")
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias="refreshToken"),
    db: DbSession = Depends(get_db),
) -> dict[str, object]:
    result = services.refresh(db, refresh_token)
    _set_refresh_cookie(response, str(result["refreshToken"]), int(result["refreshExpiryMs"]))

    return {
        "token": result["token"],
        "user": result["user"],
    }


@router.get("/verify-email")
def verify_email(
    username: str | None = Query(default=None),
    token: str | None = Query(default=None),
    db: DbSession = Depends(get_db),
) -> dict[str, str]:
    valid_username, valid_token = validate_verify_email(username, token)
    return services.verify_email(db, valid_username, valid_token)


@router.post("/resend-verification")
def resend_verification(
    body: dict[str, Any] = Body(default_factory=dict),
    db: DbSession = Depends(get_db),
) -> dict[str, str]:
    email, username = validate_resend_verification(body)
    return services.resend_verification(db, email, username)
