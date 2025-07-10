from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from db.config import SessionLocal
from db.crud import CRUDManager
from typing import Optional
import logging

router = APIRouter(prefix="/profile", tags=["profile"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    wallet_address: Optional[str] = None

class FundProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    wallet_address: Optional[str] = None

@router.patch("/user/{user_id}")
async def update_user_profile(user_id: int, data: UserProfileUpdateRequest, db: Session = Depends(get_db)):
    crud = CRUDManager(db)
    try:
        logger.info(f"User profile update attempt: user_id={user_id}, data={data.dict(exclude_unset=True)}")
        user = crud.users.get_by_id(user_id)
        if not user:
            logger.warning(f"User not found for update: user_id={user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        updated = crud.users.update(user_id, **data.dict(exclude_unset=True))
        if not updated:
            logger.error(f"User profile update failed: user_id={user_id}")
            raise HTTPException(status_code=400, detail="Update failed")
        logger.info(f"User profile updated successfully: user_id={user_id}")
        return {"message": "User profile updated", "user": updated}
    finally:
        crud.close()

@router.patch("/fund/{fund_id}")
async def update_fund_profile(fund_id: int, data: FundProfileUpdateRequest, db: Session = Depends(get_db)):
    crud = CRUDManager(db)
    try:
        logger.info(f"Fund profile update attempt: fund_id={fund_id}, data={data.dict(exclude_unset=True)}")
        fund = crud.funds.get_by_id(fund_id)
        if not fund:
            logger.warning(f"Fund not found for update: fund_id={fund_id}")
            raise HTTPException(status_code=404, detail="Fund not found")
        updated = crud.funds.update(fund_id, **data.dict(exclude_unset=True))
        if not updated:
            logger.error(f"Fund profile update failed: fund_id={fund_id}")
            raise HTTPException(status_code=400, detail="Update failed")
        logger.info(f"Fund profile updated successfully: fund_id={fund_id}")
        return {"message": "Fund profile updated", "fund": updated}
    finally:
        crud.close() 