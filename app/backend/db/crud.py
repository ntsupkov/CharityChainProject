from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from db.config import Base
from db.models import User, Fund, FundList, Collection, Nft, Inventory, Donation, DonationNft

class BaseCRUD:
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def commit_and_refresh(self, obj):
        self.db.commit()
        self.db.refresh(obj)
        return obj

class UserCRUD(BaseCRUD):
    def create(self, name: str, email: str, hashed_password: str, wallet_address: str | None) -> User:
        user = User(
            name=name,
            email=email,
            hashed_password=hashed_password,
            wallet_address=wallet_address
        )
        self.db.add(user)
        return self.commit_and_refresh(user)
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def update(self, user_id: int, **kwargs) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            return self.commit_and_refresh(user)
        return None
    
    def delete(self, user_id: int) -> bool:
        user = self.get_by_id(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
    
    def update_stats(self, user_id: int, projects_supported_cnt: int | None, 
                    total_donated: float | None, nft_cnt: int | None) -> Optional[User]:
        updates = {}
        if projects_supported_cnt is not None:
            updates['projects_supported_cnt'] = projects_supported_cnt
        if total_donated is not None:
            updates['total_donated'] = total_donated
        if nft_cnt is not None:
            updates['nft_cnt'] = nft_cnt
        
        return self.update(user_id, **updates)

class FundCRUD(BaseCRUD):
    def create(self, name: str, email: str, hashed_password: str, wallet_address: str | None) -> Fund:
        fund = Fund(
            name=name,
            email=email,
            hashed_password=hashed_password,
            wallet_address=wallet_address
        )
        self.db.add(fund)
        return self.commit_and_refresh(fund)
    
    def get_by_id(self, fund_id: int) -> Optional[Fund]:
        return self.db.query(Fund).filter(Fund.id == fund_id).first()
    
    def get_by_email(self, email: str) -> Optional[Fund]:
        return self.db.query(Fund).filter(Fund.email == email).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Fund]:
        return self.db.query(Fund).offset(skip).limit(limit).all()
    
    def update(self, fund_id: int, **kwargs) -> Optional[Fund]:
        fund = self.get_by_id(fund_id)
        if fund:
            for key, value in kwargs.items():
                if hasattr(fund, key):
                    setattr(fund, key, value)
            return self.commit_and_refresh(fund)
        return None
    
    def delete(self, fund_id: int) -> bool:
        fund = self.get_by_id(fund_id)
        if fund:
            self.db.delete(fund)
            self.db.commit()
            return True
        return False
    
    def update_stats(self, fund_id: int, collections_created: int | None, 
                    total_raised: float | None) -> Optional[Fund]:
        updates = {}
        if collections_created is not None:
            updates['collections_created'] = collections_created
        if total_raised is not None:
            updates['total_raised'] = total_raised
        
        return self.update(fund_id, **updates)

class FundListCRUD(BaseCRUD):
    def create(self, creator_id: int) -> FundList:
        fund_list = FundList(creator_id=creator_id)
        self.db.add(fund_list)
        return self.commit_and_refresh(fund_list)
    
    def get_by_id(self, fund_list_id: int) -> Optional[FundList]:
        return self.db.query(FundList).filter(FundList.id == fund_list_id).first()
    
    def get_by_creator(self, creator_id: int) -> List[FundList]:
        return self.db.query(FundList).filter(FundList.creator_id == creator_id).all()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[FundList]:
        return self.db.query(FundList).offset(skip).limit(limit).all()
    
    def delete(self, fund_list_id: int) -> bool:
        fund_list = self.get_by_id(fund_list_id)
        if fund_list:
            self.db.delete(fund_list)
            self.db.commit()
            return True
        return False

class CollectionCRUD(BaseCRUD):
    def create(self, name: str, description: str, goal: float, fund_id: int, 
               prompt: str | None, meta_list: Dict | None, deadline: datetime | None) -> Collection:
        collection = Collection(
            name=name,
            description=description,
            goal=goal,
            fund_id=fund_id,
            prompt=prompt,
            meta_list=meta_list or {},
            deadline=deadline
        )
        self.db.add(collection)
        return self.commit_and_refresh(collection)
    
    def get_by_id(self, collection_id: int) -> Optional[Collection]:
        return self.db.query(Collection).filter(Collection.id == collection_id).first()
    
    def get_by_fund(self, fund_id: int) -> List[Collection]:
        return self.db.query(Collection).filter(Collection.fund_id == fund_id).all()
    
    def get_active(self) -> List[Collection]:
        return self.db.query(Collection).filter(Collection.active == True).all()
    
    def get_by_name(self, name: str) -> List[Collection]:
        return self.db.query(Collection).filter(Collection.name.ilike(f"%{name}%")).all()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Collection]:
        return self.db.query(Collection).offset(skip).limit(limit).all()
    
    def update(self, collection_id: int, **kwargs) -> Optional[Collection]:
        collection = self.get_by_id(collection_id)
        if collection:
            for key, value in kwargs.items():
                if hasattr(collection, key):
                    setattr(collection, key, value)
            return self.commit_and_refresh(collection)
        return None
    
    def delete(self, collection_id: int) -> bool:
        collection = self.get_by_id(collection_id)
        if collection:
            self.db.delete(collection)
            self.db.commit()
            return True
        return False
    
    def close_collection(self, collection_id: int) -> Optional[Collection]:
        return self.update(collection_id, active=False, closed_at=datetime.utcnow())
    
    def update_raised_amount(self, collection_id: int, amount: float) -> Optional[Collection]:
        collection = self.get_by_id(collection_id)
        if collection:
            raised = float(getattr(collection, 'raised', 0.0))
            new_raised = raised + amount
            return self.update(collection_id, raised=new_raised)
        return None

class NftCRUD(BaseCRUD):
    def create(self, ipfs_link: str, collection_id: int, rarity: str, attributes: Dict | None) -> Nft:
        nft = Nft(
            ipfs_link=ipfs_link,
            collection_id=collection_id,
            rarity=rarity,
            attributes=attributes or {}
        )
        self.db.add(nft)
        return self.commit_and_refresh(nft)
    
    def get_by_id(self, nft_id: int) -> Optional[Nft]:
        return self.db.query(Nft).filter(Nft.id == nft_id).first()
    
    def get_by_collection(self, collection_id: int) -> List[Nft]:
        return self.db.query(Nft).filter(Nft.collection_id == collection_id).all()
    
    def get_by_rarity(self, rarity: str) -> List[Nft]:
        return self.db.query(Nft).filter(Nft.rarity == rarity).all()
    
    def get_by_collection_and_rarity(self, collection_id: int, rarity: str) -> List[Nft]:
        return self.db.query(Nft).filter(
            Nft.collection_id == collection_id,
            Nft.rarity == rarity
        ).all()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Nft]:
        return self.db.query(Nft).offset(skip).limit(limit).all()
    
    def update(self, nft_id: int, **kwargs) -> Optional[Nft]:
        nft = self.get_by_id(nft_id)
        if nft:
            for key, value in kwargs.items():
                if hasattr(nft, key):
                    setattr(nft, key, value)
            return self.commit_and_refresh(nft)
        return None
    
    def delete(self, nft_id: int) -> bool:
        nft = self.get_by_id(nft_id)
        if nft:
            self.db.delete(nft)
            self.db.commit()
            return True
        return False

class InventoryCRUD(BaseCRUD):
    def create(self, user_id: int) -> Inventory:
        inventory = Inventory(user_id=user_id)
        self.db.add(inventory)
        return self.commit_and_refresh(inventory)
    
    def get_by_user(self, user_id: int) -> Optional[Inventory]:
        return self.db.query(Inventory).filter(Inventory.user_id == user_id).first()
    
    def get_or_create(self, user_id: int) -> Inventory:
        """Получить инвентарь или создать новый"""
        inventory = self.get_by_user(user_id)
        if not inventory:
            inventory = self.create(user_id)
        return inventory
    
    def add_nft_to_inventory(self, user_id: int, nft_id: int, rarity: str) -> Optional[Inventory]:
        inventory = self.get_or_create(user_id)
        rarity_field = f"{rarity.lower()}_ids"
        
        if hasattr(inventory, rarity_field):
            current_ids = getattr(inventory, rarity_field) or []
            if nft_id not in current_ids:  # Избегаем дубликатов
                current_ids.append(nft_id)
                setattr(inventory, rarity_field, current_ids)
                return self.commit_and_refresh(inventory)
        return inventory
    
    def remove_nft_from_inventory(self, user_id: int, nft_id: int, rarity: str) -> Optional[Inventory]:
        inventory = self.get_by_user(user_id)
        if inventory:
            rarity_field = f"{rarity.lower()}_ids"
            if hasattr(inventory, rarity_field):
                current_ids = getattr(inventory, rarity_field) or []
                if nft_id in current_ids:
                    current_ids.remove(nft_id)
                    setattr(inventory, rarity_field, current_ids)
                    return self.commit_and_refresh(inventory)
        return None
    
    def get_all_nfts(self, user_id: int) -> List[int]:
        """Получить все NFT ID пользователя"""
        inventory = self.get_by_user(user_id)
        if not inventory:
            return []
        
        all_nfts = []
        rarity_fields = ['common_ids', 'uncommon_ids', 'rare_ids', 'epic_ids', 'legendary_ids', 'mythic_ids']
        
        for field in rarity_fields:
            ids = getattr(inventory, field) or []
            all_nfts.extend(ids)
        
        return all_nfts
    
    def get_nfts_by_rarity(self, user_id: int, rarity: str) -> List[int]:
        """Получить NFT определенной редкости"""
        inventory = self.get_by_user(user_id)
        if not inventory:
            return []
        
        rarity_field = f"{rarity.lower()}_ids"
        if hasattr(inventory, rarity_field):
            return getattr(inventory, rarity_field) or []
        return []
    
    def delete(self, user_id: int) -> bool:
        inventory = self.get_by_user(user_id)
        if inventory:
            self.db.delete(inventory)
            self.db.commit()
            return True
        return False

class DonationCRUD(BaseCRUD):
    def create(self, user_id: int, collection_id: int, amount: float) -> Donation:
        donation = Donation(
            user_id=user_id,
            collection_id=collection_id,
            amount=amount
        )
        self.db.add(donation)
        return self.commit_and_refresh(donation)
    
    def get_by_id(self, donation_id: int) -> Optional[Donation]:
        return self.db.query(Donation).filter(Donation.id == donation_id).first()
    
    def get_by_user(self, user_id: int) -> List[Donation]:
        return self.db.query(Donation).filter(Donation.user_id == user_id).all()
    
    def get_by_collection(self, collection_id: int) -> List[Donation]:
        return self.db.query(Donation).filter(Donation.collection_id == collection_id).all()
    
    def get_total_by_user(self, user_id: int) -> float:
        """Получить общую сумму донатов пользователя"""
        result = self.db.query(Donation).filter(Donation.user_id == user_id).all()
        def safe_amount(donation):
            amt = donation.amount
            if hasattr(amt, '__class__') and amt.__class__.__module__.startswith('sqlalchemy'):
                return float(getattr(donation, 'amount', 0.0))
            return float(amt)
        return sum(safe_amount(donation) for donation in result)
    
    def get_total_by_collection(self, collection_id: int) -> float:
        """Получить общую сумму донатов коллекции"""
        result = self.db.query(Donation).filter(Donation.collection_id == collection_id).all()
        def safe_amount(donation):
            amt = donation.amount
            if hasattr(amt, '__class__') and amt.__class__.__module__.startswith('sqlalchemy'):
                return float(getattr(donation, 'amount', 0.0))
            return float(amt)
        return sum(safe_amount(donation) for donation in result)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Donation]:
        return self.db.query(Donation).offset(skip).limit(limit).all()
    
    def update(self, donation_id: int, **kwargs) -> Optional[Donation]:
        donation = self.get_by_id(donation_id)
        if donation:
            for key, value in kwargs.items():
                if hasattr(donation, key):
                    setattr(donation, key, value)
            return self.commit_and_refresh(donation)
        return None
    
    def delete(self, donation_id: int) -> bool:
        donation = self.get_by_id(donation_id)
        if donation:
            self.db.delete(donation)
            self.db.commit()
            return True
        return False

class DonationNftCRUD(BaseCRUD):
    def create(self, donation_id: int, nft_id: int) -> DonationNft:
        donation_nft = DonationNft(
            donation_id=donation_id,
            nft_id=nft_id
        )
        self.db.add(donation_nft)
        return self.commit_and_refresh(donation_nft)
    
    def get_by_id(self, donation_nft_id: int) -> Optional[DonationNft]:
        return self.db.query(DonationNft).filter(DonationNft.id == donation_nft_id).first()
    
    def get_by_donation(self, donation_id: int) -> List[DonationNft]:
        return self.db.query(DonationNft).filter(DonationNft.donation_id == donation_id).all()
    
    def get_by_nft(self, nft_id: int) -> List[DonationNft]:
        return self.db.query(DonationNft).filter(DonationNft.nft_id == nft_id).all()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[DonationNft]:
        return self.db.query(DonationNft).offset(skip).limit(limit).all()
    
    def delete(self, donation_nft_id: int) -> bool:
        donation_nft = self.get_by_id(donation_nft_id)
        if donation_nft:
            self.db.delete(donation_nft)
            self.db.commit()
            return True
        return False
    
    def delete_by_donation(self, donation_id: int) -> bool:
        """Удалить все NFT связанные с донатом"""
        donation_nfts = self.get_by_donation(donation_id)
        if donation_nfts:
            for dn in donation_nfts:
                self.db.delete(dn)
            self.db.commit()
            return True
        return False


class CRUDManager:
    """Менеджер для управления всеми CRUD операциями"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.users = UserCRUD(db_session)
        self.funds = FundCRUD(db_session)
        self.fund_lists = FundListCRUD(db_session)
        self.collections = CollectionCRUD(db_session)
        self.nfts = NftCRUD(db_session)
        self.inventory = InventoryCRUD(db_session)
        self.donations = DonationCRUD(db_session)
        self.donation_nfts = DonationNftCRUD(db_session)
    
    def close(self):
        """Закрытие сессии"""
        self.db.close()