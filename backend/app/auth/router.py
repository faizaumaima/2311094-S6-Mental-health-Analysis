from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.auth.dependencies import get_current_user
from app.auth.models import AuthSession, User
from app.auth.schemas import TokenResponse, UserLogin, UserRegister, UserResponse
from app.auth.service import (
    authenticate_user,
    create_user_session,
    register_user,
    refresh_user_session,
    revoke_user_session,
    change_user_password,
)
from app.database import get_session
from app.admin.service import create_audit_log
from app.auth.schemas import (
    AuthSessionResponse,
    PasswordChange,
    RefreshRequest,
    UserProfileUpdate,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
users_router = APIRouter(prefix="/api/users", tags=["User Management"])

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserRegister,
    session: Session = Depends(get_session),
):
    return register_user(
        session,
        name=data.name,
        email=str(data.email),
        password=data.password,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    data: UserLogin,
    request: Request,
    session: Session = Depends(get_session),
):
    try:
        user = authenticate_user(
            session,
            email=str(data.email),
            password=data.password,
        )
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            normalized_email = str(data.email).strip().lower()

            failed_user = session.exec(
                select(User).where(User.email == normalized_email)
            ).first()

            if failed_user:
                ip_address = (
                    request.client.host if request.client else "unknown"
                )
                user_agent = request.headers.get("user-agent", "unknown")

                create_audit_log(
                    session,
                    actor_user_id=failed_user.id,
                    action="login_failed",
                    details=(
                        f"IP: {ip_address}; "
                        f"User-Agent: {user_agent}"
                    ),
                )

        raise

    return create_user_session(session, user)


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user
@router.post("/refresh", response_model=TokenResponse)
def refresh(
    data: RefreshRequest,
    session: Session = Depends(get_session),
):
    return refresh_user_session(session, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: RefreshRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    revoke_user_session(session, data.refresh_token)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    change_user_password(
        session,
        current_user,
        data.current_password,
        data.new_password,
    )

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    current_user.name = data.name.strip()

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user

@users_router.get("/me/sessions", response_model=list[AuthSessionResponse])
def list_my_sessions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)

    sessions = session.exec(
        select(AuthSession)
        .where(
            AuthSession.user_id == current_user.id,
            AuthSession.revoked == False,
            AuthSession.expires_at > now,
        )
        .order_by(AuthSession.created_at.desc())
    ).all()

    return sessions

@users_router.delete("/me/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_my_session(
    session_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    auth_session = session.get(AuthSession, session_id)

    if auth_session is None or auth_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    if auth_session.revoked:
        raise HTTPException(status_code=404, detail="Session not found")

    auth_session.revoked = True
    session.add(auth_session)
    session.commit()

    return None
