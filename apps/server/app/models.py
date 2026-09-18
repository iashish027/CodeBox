from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

difficulty_enum = PgEnum("EASY", "MEDIUM", "HARD", name="Difficulty", create_type=False)
role_enum = PgEnum("Admin", "User", "Setter", name="Role", create_type=False)
submission_status_enum = PgEnum(
    "PENDING",
    "RUNNING",
    "ACCEPTED",
    "WRONG_ANSWER",
    "TIME_LIMIT_EXCEEDED",
    "MEMORY_LIMIT_EXCEEDED",
    "RUNTIME_ERROR",
    "COMPILATION_ERROR",
    name="SubmissionStatus",
    create_type=False,
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    role: Mapped[str] = mapped_column(role_enum, default="User")
    passwordHash: Mapped[str] = mapped_column("password_hash", String)
    isVerified: Mapped[bool] = mapped_column(Boolean, default=False)
    verificationToken: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tokenExpiry: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime, default=datetime.utcnow)

    sessions: Mapped[list["Session"]] = relationship(back_populates="user")


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (Index("ix_sessions_userId", "userId"), Index("ix_sessions_expiresAt", "expiresAt"))

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    userId: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    refreshHash: Mapped[str] = mapped_column(String(255))
    userAgent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ipAddress: Mapped[str | None] = mapped_column(String(45), nullable=True)
    expiresAt: Mapped[datetime] = mapped_column(DateTime)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="sessions")


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(300), unique=True)
    description: Mapped[str] = mapped_column(Text)
    sampleInput: Mapped[str] = mapped_column(Text)
    sampleOutput: Mapped[str] = mapped_column(Text)
    inputFormat: Mapped[str] = mapped_column(Text)
    outputFormat: Mapped[str] = mapped_column(Text)
    constraints: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str | None] = mapped_column(difficulty_enum, nullable=True)
    timeLimit: Mapped[int] = mapped_column("time_limit", Integer)
    memoryLimit: Mapped[int] = mapped_column("memory_limit", Integer)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime, default=datetime.utcnow)


class TestCase(Base):
    __tablename__ = "testcases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    problemId: Mapped[int] = mapped_column("problem_id", ForeignKey("problems.id", ondelete="CASCADE"))
    inputPath: Mapped[str] = mapped_column("input_path", String)
    outputPath: Mapped[str] = mapped_column("output_path", String)
    isHidden: Mapped[bool] = mapped_column("is_hidden", Boolean, default=True)


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (Index("ix_submissions_user_id", "user_id"), Index("ix_submissions_problem_id", "problem_id"))

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    userId: Mapped[int] = mapped_column("user_id", ForeignKey("users.id", ondelete="CASCADE"))
    problemId: Mapped[int] = mapped_column("problem_id", ForeignKey("problems.id", ondelete="CASCADE"))
    language: Mapped[str | None] = mapped_column(String(20), nullable=True)
    code: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(submission_status_enum, default="PENDING")
    executionTime: Mapped[int | None] = mapped_column("execution_time", Integer, nullable=True)
    memoryUsed: Mapped[int | None] = mapped_column("memory_used", Integer, nullable=True)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime, default=datetime.utcnow)


class SubmissionResult(Base):
    __tablename__ = "submission_results"
    __table_args__ = (
        Index("ix_submission_results_submission_id", "submission_id"),
        Index("ix_submission_results_testcase_id", "testcase_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submissionId: Mapped[int] = mapped_column("submission_id", ForeignKey("submissions.id", ondelete="CASCADE"))
    testcaseId: Mapped[int] = mapped_column("testcase_id", ForeignKey("testcases.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(submission_status_enum)
    executionTime: Mapped[int | None] = mapped_column("execution_time", Integer, nullable=True)
