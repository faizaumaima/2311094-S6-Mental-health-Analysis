import os
from datetime import datetime, timedelta, timezone

import jwt


ALGORITHM = "HS256"


def create_access_token(user_id: int, role: str) -> str:
    secret = os.environ["JWT_SECRET"]
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "15"))
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "exp": expires,
    }

    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    secret = os.environ["JWT_SECRET"]
    expires = datetime.now(timezone.utc) + timedelta(
        days=int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
    )

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expires,
    }

    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    secret = os.environ["JWT_SECRET"]
    return jwt.decode(token, secret, algorithms=[ALGORITHM])