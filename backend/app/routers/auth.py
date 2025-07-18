from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from .. import models
from ..schemas import UserCreate, UserOut, Token, UserProfileOut, CVOut
from ..crud import create_user, authenticate_user, get_user_by_email
from ..dependencies import get_db, get_current_user
from ..utils.security import create_access_token
from ..routers.cv import read_my_cv
import logging
log = logging.getLogger("auth")

router = APIRouter(tags=["auth"])

@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(400, "Email already registered")
    user = create_user(db, user_in.email, user_in.password)
    log.info("← signup completed, new user id=%s", user.id)
    return user

@router.post("/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserProfileOut)
def read_current_user(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    # 1) Try to fetch & serialize their CV exactly as /cv/me does
    try:
        cv_data: CVOut = read_my_cv(db, user)
    except HTTPException:
        cv_data = None

    # 2) Return everything as a plain dict
    return {
        "id":               user.id,
        "email":            user.email,
        "created_at":       user.created_at,
        "has_uploaded_cv":  user.has_uploaded_cv,
        "cv":               cv_data,
    }
