import re
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.models import Problem
from app.shared.errors.api_error import ApiError
from app.shared.errors.error_codes import ErrorCodes


def generate_slug(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    return re.sub(r"-+", "-", slug)


def _serialize_problem(problem: Problem) -> dict[str, Any]:
    return {
        "id": problem.id,
        "title": problem.title,
        "slug": problem.slug,
        "description": problem.description,
        "sampleInput": problem.sampleInput,
        "sampleOutput": problem.sampleOutput,
        "inputFormat": problem.inputFormat,
        "outputFormat": problem.outputFormat,
        "constraints": problem.constraints,
        "difficulty": problem.difficulty,
        "timeLimit": problem.timeLimit,
        "memoryLimit": problem.memoryLimit,
        "createdAt": problem.createdAt.isoformat() if isinstance(problem.createdAt, datetime) else problem.createdAt,
    }


def check_title_unique(db: DbSession, title: str, exclude_id: int | None = None) -> str:
    slug = generate_slug(title)
    existing = db.scalar(select(Problem).where(Problem.slug == slug))

    if existing and existing.id != exclude_id:
        raise ApiError(
            409,
            ErrorCodes.CONFLICT,
            "Problem with this title already exists",
        )

    return slug


def create_problem(db: DbSession, problem: dict[str, Any]) -> dict[str, Any]:
    slug = check_title_unique(db, problem["title"])

    new_problem = Problem(
        slug=slug,
        title=problem["title"],
        description=problem["description"],
        difficulty=problem.get("difficulty"),
        timeLimit=problem["timeLimit"],
        memoryLimit=problem["memoryLimit"],
        sampleInput=problem["sampleInput"],
        sampleOutput=problem["sampleOutput"],
        inputFormat=problem["inputFormat"],
        outputFormat=problem["outputFormat"],
        constraints=problem["constraints"],
    )

    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)

    return _serialize_problem(new_problem)


def update_problem(db: DbSession, problem: dict[str, Any]) -> dict[str, Any]:
    slug = generate_slug(problem["title"])
    current_problem = db.scalar(select(Problem).where(Problem.slug == slug))

    if not current_problem:
        raise ApiError(
            401,
            ErrorCodes.INVALID_INPUT,
            "Problem with this title does not exist",
        )

    update_fields = [
        "description",
        "difficulty",
        "timeLimit",
        "memoryLimit",
        "sampleInput",
        "sampleOutput",
        "inputFormat",
        "outputFormat",
        "constraints",
    ]

    for field in update_fields:
        if problem.get(field):
            setattr(current_problem, field, problem[field])

    db.commit()
    db.refresh(current_problem)

    return _serialize_problem(current_problem)
