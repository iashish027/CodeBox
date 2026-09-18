import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.shared.errors.api_error import ApiError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, error: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=error.status,
            content={
                "success": False,
                "code": error.code,
                "message": error.message,
            },
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, error: Exception) -> JSONResponse:
        logger.exception("Unexpected Error: %s", error)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "code": "INTERNAL_ERROR",
                "message": "Internal Server Error",
            },
        )
