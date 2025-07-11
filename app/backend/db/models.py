from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from db.config import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    funds = relationship("Fund", back_populates="user")
    donors = relationship("Donor", back_populates="user")

class Fund(Base):
    __tablename__ = "funds"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    logo = Column(String)
    website = Column(String)
    wallet = Column(String)
    user = relationship("User", back_populates="funds")

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    wallet = Column(String)
    user = relationship("User", back_populates="donors")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    goal = Column(Float, nullable=False)
    collected = Column(Float, default=0)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)

class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

class NFTCollection(Base):
    __tablename__ = "nft_collections"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)