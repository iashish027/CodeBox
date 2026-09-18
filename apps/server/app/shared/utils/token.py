import hashlib
import secrets


def generate_refresh_token() -> str:
    return secrets.token_hex(40)


def generate_verification_token() -> str:
    return secrets.token_hex(40)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
