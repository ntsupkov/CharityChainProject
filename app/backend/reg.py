import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.models import User, Fund, Donor
from db.crud import create_user, get_user_by_email, create_fund, create_donor
from db.config import SessionLocal
from sqlalchemy.exc import IntegrityError
from typing import Optional
from passlib.context import CryptContext

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str
    fund_name: Optional[str] = None
    fund_description: Optional[str] = None
    fund_logo: Optional[str] = None
    fund_website: Optional[str] = None
    fund_wallet: Optional[str] = None
    donor_wallet: Optional[str] = None

class RegisterResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    fund_id: Optional[int] = None
    donor_id: Optional[int] = None

@router.post("/register", response_model=RegisterResponse)
def register_user(request: RegisterRequest):
    db = SessionLocal()
    try:
        if get_user_by_email(db, request.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = pwd_context.hash(request.password)
        user = create_user(db, request.email, hashed_password, request.name, request.role)
        fund_id = None
        donor_id = None
        if request.role == "fund":
            fund = create_fund(
                db,
                user_id=user.id,
                name=request.fund_name,
                description=request.fund_description,
                logo=request.fund_logo,
                website=request.fund_website,
                wallet=request.fund_wallet
            )
            fund_id = fund.id
        elif request.role == "donor":
            donor = create_donor(
                db,
                user_id=user.id,
                wallet=request.donor_wallet
            )
            donor_id = donor.id
        db.commit()
        return RegisterResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            fund_id=fund_id,
            donor_id=donor_id
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error")
    finally:
        db.close()