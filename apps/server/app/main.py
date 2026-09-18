from fastapi import FastAPI

from app.modules.auth.routes import router as auth_router
from app.modules.problems.routes import router as problems_router
from app.shared.errors.handlers import register_exception_handlers

app = FastAPI(
    title="CodeBox API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"message": "Codebox server is running"}


app.include_router(auth_router, prefix="/api/auth")
app.include_router(problems_router, prefix="/api/problems")
register_exception_handlers(app)
