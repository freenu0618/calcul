"""인증 API 라우터 (회원가입, 로그인)"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.db import get_db, UserModel
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user

router = APIRouter()


# Pydantic 스키마
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="8자 이상")
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    """회원가입

    Args:
        user: 회원가입 정보 (이메일, 비밀번호)
        db: DB 세션

    Returns:
        UserResponse: 생성된 사용자 정보

    Raises:
        HTTPException: 이메일 중복 시 400
    """
    # 이메일 중복 검사
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # 비밀번호 해싱
    hashed_password = get_password_hash(user.password)

    # 사용자 생성
    db_user = UserModel(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """로그인

    Args:
        user: 로그인 정보 (이메일, 비밀번호)
        db: DB 세션

    Returns:
        Token: JWT 액세스 토큰

    Raises:
        HTTPException: 인증 실패 시 401
    """
    # 사용자 조회
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # 비밀번호 검증
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # 활성 사용자 확인
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    # JWT 토큰 생성
    access_token = create_access_token(data={"sub": db_user.email})

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """현재 사용자 정보 조회

    Args:
        current_user: 인증된 사용자 (의존성 주입)

    Returns:
        UserResponse: 현재 사용자 정보
    """
    return current_user


@router.post("/logout")
def logout():
    """로그아웃 (클라이언트에서 토큰 삭제)

    Note:
        JWT는 stateless이므로 서버에서 별도 처리 없음.
        클라이언트가 localStorage에서 토큰 삭제.
    """
    return {"message": "Successfully logged out"}
