import uvicorn

from app.config.env import get_env


if __name__ == "__main__":
    env = get_env()
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=int(env.SERVER_PORT or 5000),
        reload=True,
    )
