import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

engine = create_engine(DATABASE_URL, echo=True)  # echo=True полезно для отладки

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_session():
    return SessionLocal()

def create_tables():
    from db import models  # обязательно импортируйте модели перед созданием
    Base.metadata.create_all(bind=engine)

def drop_tables():
    from db import models
    Base.metadata.drop_all(bind=engine)
