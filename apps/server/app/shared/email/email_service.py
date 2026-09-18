from email.message import EmailMessage
import smtplib

from app.config.env import get_env


def send_mail(to: str, subject: str, text: str) -> dict[str, object]:
    env = get_env()
    if not to or not text:
        raise ValueError("Missing required fields: to + (text or html)")

    message = EmailMessage()
    message["From"] = f'"My App" <{env.SMTP_USER}>'
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)

    host = env.SMTP_HOST
    port = int(env.SMTP_PORT or 0)
    if not host or not port:
        raise ValueError("SMTP_HOST and SMTP_PORT are required")

    if env.SMTP_SECURE:
        smtp: smtplib.SMTP = smtplib.SMTP_SSL(host, port)
    else:
        smtp = smtplib.SMTP(host, port)

    with smtp:
        if env.SMTP_USER and env.SMTP_PASS:
            smtp.login(env.SMTP_USER, env.SMTP_PASS)
        refused = smtp.send_message(message)

    accepted = [] if refused else [to]
    return {"accepted": accepted, "rejected": list(refused.keys())}


def send_verification_mail(email: str, username: str, token: str) -> dict[str, object]:
    env = get_env()
    verification_url = (
        f"{env.FRONTEND_URL}/verify-email?username={username}&token={token}"
    )

    info = send_mail(
        to=email,
        subject="Ublog account verification",
        text=f"Please verify your account by clicking the following link: {verification_url}",
    )

    if not info["accepted"]:
        raise RuntimeError("Unable to send verification email")

    return info
