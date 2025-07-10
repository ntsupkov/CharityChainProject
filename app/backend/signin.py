from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from db.config import SessionLocal
from db.crud import CRUDManager
from reg import verify_password, extract_value
from datetime import datetime
from typing import cast
import logging

router = APIRouter(prefix="/auth", tags=["authentication"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class SignInResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    registration_date: datetime
    message: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signin", response_model=SignInResponse)
async def signin(
    data: SignInRequest,
    db: Session = Depends(get_db)
):
    crud = CRUDManager(db)
    try:
        logger.info(f"Signin attempt: {data.email}")
        user = crud.users.get_by_email(data.email)
        if user and verify_password(data.password, cast(str, extract_value(user.hashed_password, 'hashed_password'))):
            user_id = cast(int, extract_value(user.id, 'id'))
            user_name = cast(str, extract_value(user.name, 'name'))
            user_email = cast(str, extract_value(user.email, 'email'))
            user_reg_date = cast(datetime, extract_value(user.registration_date, 'registration_date'))
            logger.info(f"User login successful: {user_email}")
            return SignInResponse(
                id=user_id,
                name=user_name,
                email=user_email,
                role="user",
                registration_date=user_reg_date,
                message="Вход выполнен успешно"
            )
        fund = crud.funds.get_by_email(data.email)
        if fund and verify_password(data.password, cast(str, extract_value(fund.hashed_password, 'hashed_password'))):
            fund_id = cast(int, extract_value(fund.id, 'id'))
            fund_name = cast(str, extract_value(fund.name, 'name'))
            fund_email = cast(str, extract_value(fund.email, 'email'))
            fund_reg_date = cast(datetime, extract_value(fund.registration_date, 'registration_date'))
            logger.info(f"Fund login successful: {fund_email}")
            return SignInResponse(
                id=fund_id,
                name=fund_name,
                email=fund_email,
                role="fund",
                registration_date=fund_reg_date,
                message="Вход выполнен успешно"
            )
        logger.warning(f"Failed signin attempt for email: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    except HTTPException as e:
        logger.error(f"Signin error: {e.detail}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during signin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при входе: {str(e)}"
        )