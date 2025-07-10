from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.config import SessionLocal
from db.crud import CRUDManager
from typing import Optional
import logging

router = APIRouter(prefix="/donation", tags=["donation"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DonationRequest(BaseModel):
    user_id: int
    collection_id: int
    amount: float

@router.post("/make", status_code=201)
async def make_donation(data: DonationRequest, db: Session = Depends(get_db)):
    crud = CRUDManager(db)
    try:
        logger.info(f"Donation attempt: user_id={data.user_id}, collection_id={data.collection_id}, amount={data.amount}")
        user = crud.users.get_by_id(data.user_id)
        collection = crud.collections.get_by_id(data.collection_id)
        if not user or not collection:
            logger.warning(f"Donation failed: user or collection not found (user_id={data.user_id}, collection_id={data.collection_id})")
            raise HTTPException(status_code=404, detail="User or collection not found")
        # Всегда разрешаем донат (кошелёк считается подключённым)
        donation = crud.donations.create(user_id=data.user_id, collection_id=data.collection_id, amount=data.amount)
        # Обновляем сумму собранного в коллекции
        crud.collections.update_raised_amount(data.collection_id, data.amount)
        logger.info(f"Donation successful: donation_id={donation.id}, user_id={data.user_id}, collection_id={data.collection_id}, amount={data.amount}")
        return {"message": "Donation successful", "donation": donation}
    except Exception as e:
        logger.exception(f"Donation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Donation error: {str(e)}")
    finally:
        crud.close() 