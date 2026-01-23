from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# --- POPRAWKA ---
# Pobieramy adres bazy ze zmiennych środowiskowych (które ustawia Docker).
# localhost używamy TYLKO jako awaryjnej opcji (np. przy uruchamianiu bez Dockera).
SQLALCHEMY_DATABASE_URL = os.getenv(
    "SQLALCHEMY_DATABASE_URL",
    "oracle+oracledb://system:SecretPassword123@localhost:1521/?service_name=XEPDB1"
)

# Tworzenie silnika bazy danych
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency (wstrzykiwanie sesji do endpointów)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()