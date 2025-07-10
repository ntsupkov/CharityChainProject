from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.config import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    registration_date = Column(TIMESTAMP, default=datetime.utcnow)
    hashed_password = Column(String(255), nullable=False)
    wallet_address = Column(String(255))
    projects_supported_cnt = Column(Integer, default=0)
    total_donated = Column(DECIMAL(15, 2), default=0.00)
    nft_cnt = Column(Integer, default=0)
    

    donations = relationship("Donation", back_populates="user")
    inventory = relationship("Inventory", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"

class Fund(Base):
    __tablename__ = "funds"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    registration_date = Column(TIMESTAMP, default=datetime.utcnow)
    hashed_password = Column(String(255), nullable=False)
    wallet_address = Column(String(255))
    collections_created = Column(Integer, default=0)
    total_raised = Column(DECIMAL(15, 2), default=0.00)
    

    fund_lists = relationship("FundList", back_populates="creator")
    collections = relationship("Collection", back_populates="fund")
    
    def __repr__(self):
        return f"<Fund(id={self.id}, name='{self.name}', email='{self.email}')>"

class FundList(Base):
    __tablename__ = "fund_lists"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    creator_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    

    creator = relationship("Fund", back_populates="fund_lists")
    
    def __repr__(self):
        return f"<FundList(id={self.id}, creator_id={self.creator_id})>"

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    goal = Column(DECIMAL(15, 2), nullable=False)
    raised = Column(DECIMAL(15, 2), default=0.00)
    prompt = Column(Text)
    meta_list = Column(JSON)
    opened_at = Column(TIMESTAMP, default=datetime.utcnow)
    closed_at = Column(TIMESTAMP)
    deadline = Column(TIMESTAMP)
    active = Column(Boolean, default=True)
    nft_gived = Column(Integer, default=0)
    donaters_count = Column(Integer, default=0)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    

    fund = relationship("Fund", back_populates="collections")
    nfts = relationship("Nft", back_populates="collection")
    donations = relationship("Donation", back_populates="collection")
    
    def __repr__(self):
        return f"<Collection(id={self.id}, name='{self.name}', goal={self.goal})>"

class Nft(Base):
    __tablename__ = "nfts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ipfs_link = Column(String(500), nullable=False)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    rarity = Column(String(50), nullable=False)
    attributes = Column(JSON)
    

    collection = relationship("Collection", back_populates="nfts")
    donation_nfts = relationship("DonationNft", back_populates="nft")
    
    def __repr__(self):
        return f"<Nft(id={self.id}, rarity='{self.rarity}', collection_id={self.collection_id})>"

class Inventory(Base):
    __tablename__ = "inventory"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    common_ids = Column(JSON, default=lambda: [])
    uncommon_ids = Column(JSON, default=lambda: [])
    rare_ids = Column(JSON, default=lambda: [])
    epic_ids = Column(JSON, default=lambda: [])
    legendary_ids = Column(JSON, default=lambda: [])
    mythic_ids = Column(JSON, default=lambda: [])
    

    user = relationship("User", back_populates="inventory")
    
    def __repr__(self):
        return f"<Inventory(user_id={self.user_id})>"

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    donated_at = Column(TIMESTAMP, default=datetime.utcnow)
    

    user = relationship("User", back_populates="donations")
    collection = relationship("Collection", back_populates="donations")
    donation_nfts = relationship("DonationNft", back_populates="donation")
    
    def __repr__(self):
        return f"<Donation(id={self.id}, amount={self.amount}, user_id={self.user_id})>"

class DonationNft(Base):
    __tablename__ = "donation_nfts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    nft_id = Column(Integer, ForeignKey("nfts.id"), nullable=False)
    

    donation = relationship("Donation", back_populates="donation_nfts")
    nft = relationship("Nft", back_populates="donation_nfts")
    
    def __repr__(self):
        return f"<DonationNft(id={self.id}, donation_id={self.donation_id}, nft_id={self.nft_id})>"