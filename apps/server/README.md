# CodeBox FastAPI Server

Python/FastAPI migration of the existing Express backend in `apps/server`.

## Setup

```bash
cd apps/server2
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
```

The server reads the same environment variables as the current Node backend:

- `DATABASE_URL`
- `SERVER_PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `FRONTEND_URL`
