from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session as DbSession

from app.config.database import get_db
from app.modules.problems.services import create_problem as create_problem_service
from app.modules.problems.services import update_problem as update_problem_service

router = APIRouter()


@router.post("/create_problem", status_code=201)
def create_problem(
    body: dict[str, Any] = Body(default_factory=dict),
    db: DbSession = Depends(get_db),
) -> dict[str, Any]:
    return create_problem_service(db, body["problem"])


@router.post("/update_problem", status_code=201)
def update_problem(
    body: dict[str, Any] = Body(default_factory=dict),
    db: DbSession = Depends(get_db),
) -> dict[str, Any]:
    return update_problem_service(db, body["problem"])
