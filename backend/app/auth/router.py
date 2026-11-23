from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
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
from app.auth.schemas import PasswordChange, RefreshRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


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
    session: Session = Depends(get_session),
):
    user = authenticate_user(
        session,
        email=str(data.email),
        password=data.password,
    )

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
    