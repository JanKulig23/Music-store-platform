from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Konfiguracja połączenia z Oracle w Dockerze
# Format: oracle+oracledb://user:password@host:port/?service_name=...
SQLALCHEMY_DATABASE_URL = "oracle+oracledb://SYSTEM:SecretPassword123@localhost:1521/?service_name=XEPDB1"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()