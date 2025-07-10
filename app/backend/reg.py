from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional, cast
from datetime import datetime
import re

from db.config import SessionLocal
from db.crud import CRUDManager
from db.models import User, Fund
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Starting registration module")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["authentication"])

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    wallet_address: Optional[str] = None

class FundRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    wallet_address: Optional[str] = None

class RegisterResponse(BaseModel):
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

def validate_password(password: str) -> bool:
    """Проверка пароля на сложность"""
    if len(password) < 8:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    return True

def validate_wallet_address(wallet_address: str) -> bool:
    """Базовая проверка адреса кошелька"""
    if not wallet_address:
        return True

    if len(wallet_address) == 42 and wallet_address.startswith("0x"):
        return True
    return False

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return pwd_context.verify(plain_password, hashed_password)

def extract_value(val, field_name=None):
    from datetime import datetime
    sqlalchemy_column_type = False
    if hasattr(val, '__class__') and val.__class__.__module__.startswith('sqlalchemy'):
        sqlalchemy_column_type = True
    if val is None or sqlalchemy_column_type:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка регистрации: поле {field_name} не содержит корректного значения (None или Column). Проверьте возврат экземпляра модели из CRUD."
        )
    # Приведение типа
    if field_name == 'registration_date':
        if not isinstance(val, datetime):
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка регистрации: поле {field_name} должно быть datetime, а не {type(val)}."
            )
        return val
    if field_name == 'id':
        if not isinstance(val, int):
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка регистрации: поле {field_name} должно быть int, а не {type(val)}."
            )
        return int(val)
    if field_name in ('name', 'email'):
        if not isinstance(val, str):
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка регистрации: поле {field_name} должно быть str, а не {type(val)}."
            )
        return str(val)
    return val

@router.post("/register/user", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Received user registration request: {user_data}")
    """
    Регистрация обычного пользователя (жертвователя)
    """
    crud = CRUDManager(db)
    
    try:
        existing_user = crud.users.get_by_email(user_data.email)
        if existing_user:
            logger.warning(f"Registration attempt with existing user email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )
        
        existing_fund = crud.funds.get_by_email(user_data.email)
        if existing_fund:
            logger.warning(f"Registration attempt with email already registered as fund: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже зарегистрирован как фонд"
            )
        
        if not validate_password(user_data.password):
            logger.warning(f"Registration attempt with weak password for email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароль должен содержать минимум 8 символов, включая буквы и цифры"
            )
        
        if user_data.wallet_address and not validate_wallet_address(user_data.wallet_address):
            logger.warning(f"Registration attempt with invalid wallet address for email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некорректный адрес кошелька"
            )
        
        hashed_password = hash_password(user_data.password)
        
        new_user = crud.users.create(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            wallet_address=user_data.wallet_address
        )
        
        user_id = cast(int, extract_value(new_user.id, 'id'))
        user_name = cast(str, extract_value(new_user.name, 'name'))
        user_email = cast(str, extract_value(new_user.email, 'email'))
        user_reg_date = cast(datetime, extract_value(new_user.registration_date, 'registration_date'))
        crud.inventory.create(user_id)
        logger.info(f"User registered successfully: {user_email}")
        return RegisterResponse(
            id=user_id,
            name=user_name,
            email=user_email,
            role="user",
            registration_date=user_reg_date,
            message="Пользователь успешно зарегистрирован"
        )
        
    except HTTPException as e:
        logger.error(f"Registration error: {e.detail}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации: {str(e)}"
        )
    finally:
        crud.close()

@router.post("/register/fund", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_fund(
    fund_data: FundRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Регистрация фонда
    """
    crud = CRUDManager(db)
    
    try:
        existing_fund = crud.funds.get_by_email(fund_data.email)
        if existing_fund:
            logger.warning(f"Fund registration attempt with existing fund email: {fund_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Фонд с таким email уже существует"
            )
        
        existing_user = crud.users.get_by_email(fund_data.email)
        if existing_user:
            logger.warning(f"Fund registration attempt with email already registered as user: {fund_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже зарегистрирован как обычный пользователь"
            )
        
        if not validate_password(fund_data.password):
            logger.warning(f"Fund registration attempt with weak password for email: {fund_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароль должен содержать минимум 8 символов, включая буквы и цифры"
            )
        
        if fund_data.wallet_address and not validate_wallet_address(fund_data.wallet_address):
            logger.warning(f"Fund registration attempt with invalid wallet address for email: {fund_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некорректный адрес кошелька"
            )
        
        hashed_password = hash_password(fund_data.password)
        
        new_fund = crud.funds.create(
            name=fund_data.name,
            email=fund_data.email,
            hashed_password=hashed_password,
            wallet_address=fund_data.wallet_address
        )
        
        fund_id = cast(int, extract_value(new_fund.id, 'id'))
        fund_name = cast(str, extract_value(new_fund.name, 'name'))
        fund_email = cast(str, extract_value(new_fund.email, 'email'))
        fund_reg_date = cast(datetime, extract_value(new_fund.registration_date, 'registration_date'))
        crud.fund_lists.create(fund_id)
        logger.info(f"Fund registered successfully: {fund_email}")
        return RegisterResponse(
            id=fund_id,
            name=fund_name,
            email=fund_email,
            role="fund",
            registration_date=fund_reg_date,
            message="Фонд успешно зарегистрирован"
        )
        
    except HTTPException as e:
        logger.error(f"Fund registration error: {e.detail}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during fund registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации: {str(e)}"
        )
    finally:
        crud.close()

class UniversalRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "donor" или "fund"
    wallet_address: Optional[str] = None

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_universal(
    register_data: UniversalRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Универсальная регистрация пользователя или фонда
    """
    if register_data.role == "donor":
        user_data = UserRegisterRequest(
            name=register_data.name,
            email=register_data.email,
            password=register_data.password,
            wallet_address=register_data.wallet_address
        )
        return await register_user(user_data, db)
    elif register_data.role == "fund":
        fund_data = FundRegisterRequest(
            name=register_data.name,
            email=register_data.email,
            password=register_data.password,
            wallet_address=register_data.wallet_address
        )
        return await register_fund(fund_data, db)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Роль должна быть 'donor' или 'fund'"
        )

@router.get("/check-email/{email}")
async def check_email_availability(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Проверка доступности email для регистрации
    """
    crud = CRUDManager(db)
    
    try:
        user_exists = crud.users.get_by_email(email) is not None
        fund_exists = crud.funds.get_by_email(email) is not None
        
        return {
            "email": email,
            "available": not (user_exists or fund_exists),
            "message": "Email доступен для регистрации" if not (user_exists or fund_exists) else "Email уже используется"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при проверке email: {str(e)}"
        )
    finally:
        crud.close()

__all__ = [
    "router",
    "hash_password",
    "verify_password",
    "validate_password",
    "validate_wallet_address"
]