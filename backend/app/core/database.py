from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- KONFIGURACJA ---
# Używamy SQLite (lokalny plik music_store.db) zamiast Oracle na start.
# Dzięki temu nie musisz instalować python-oracledb ani serwera Oracle teraz.
SQLALCHEMY_DATABASE_URL = "sqlite:///./music_store.db"

# Tworzenie silnika bazy danych (Engine)
# connect_args={"check_same_thread": False} jest wymagane tylko dla SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Fabryka sesji - tworzy nowe połączenie dla każdego żądania
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Klasa bazowa dla modeli - po niej będą dziedziczyć nasze tabele
Base = declarative_base()

# Dependency (Zależność) dla FastAPI
# Ta funkcja dba o to, żeby otworzyć bazę przed zapytaniem i zamknąć po.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()