import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.auth.models import AuthSession, User
from app.core.security import hash_password, verify_password
from app.core.tokens import create_access_token, create_refresh_token, decode_token


def register_user(session: Session, name: str, email: str, password: str) -> User:
    normalized_email = email.strip().lower()

    existing_user = session.exec(
        select(User).where(User.email == normalized_email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=name.strip(),
        email=normalized_email,
        password_hash=hash_password(password),
        role="user",
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def authenticate_user(
    session: Session, email: str, password: str
) -> User:
    normalized_email = email.strip().lower()

    user = session.exec(
        select(User).where(User.email == normalized_email)
    ).first()

    if not user or not verify_password(password, user.password_hash):
        if user:
            user.failed_login_count += 1
            session.add(user)
            session.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    return user


def create_user_session(session: Session, user: User) -> dict:
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    auth_session = AuthSession(
        user_id=user.id,
        refresh_token_hash=token_hash,
        expires_at=expires_at,
    )

    session.add(auth_session)
    session.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

def revoke_user_session(session: Session, refresh_token: str) -> None:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

    auth_session = session.exec(
        select(AuthSession).where(
            AuthSession.refresh_token_hash == token_hash
        )
    ).first()

    if auth_session and not auth_session.revoked:
        auth_session.revoked = True
        session.add(auth_session)
        session.commit()


def refresh_user_session(session: Session, refresh_token: str) -> dict:
    try:
        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")

        user_id = int(payload["sub"])

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

    auth_session = session.exec(
        select(AuthSession).where(
            AuthSession.refresh_token_hash == token_hash
        )
    ).first()

    now = datetime.now(timezone.utc)

    if (
        not auth_session
        or auth_session.revoked
        or auth_session.user_id != user_id
        or auth_session.expires_at.replace(tzinfo=timezone.utc) <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh session is invalid or expired",
        )

    user = session.get(User, user_id)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    auth_session.revoked = True
    session.add(auth_session)
    session.commit()

    return create_user_session(session, user)

def change_user_password(
    session: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    user.password_hash = hash_password(new_password)

    session.add(user)
    session.commit()