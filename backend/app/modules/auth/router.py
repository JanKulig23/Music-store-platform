from datetime import timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr # Potrzebne do JSON-a
from app.core.database import get_db
from app.modules.tenancy.models import Tenant, User
from app.core.security import get_password_hash, verify_password, create_access_token

# Definiujemy modele wejścia TUTAJ, żeby mieć pewność, że pasują do Frontendu
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequestJSON(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    # Nie wymagamy subdomeny - wygenerujemy ją sami!

class Token(BaseModel):
    access_token: str
    token_type: str

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- REJESTRACJA (JSON) ---
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_tenant_and_user(data: RegisterRequestJSON, db: Session = Depends(get_db)):
    
    # 1. Sprawdź czy email jest wolny
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ten email jest już zajęty.")
    
    # 2. Generowanie unikalnej subdomeny z nazwy firmy
    # np. "Mój Sklep" -> "moj-sklep-482"
    base_slug = data.company_name.lower().replace(" ", "-")
    # Dodajemy losową liczbę, żeby uniknąć konfliktów jak ktoś wpisze taką samą nazwę
    generated_subdomain = f"{base_slug}-{random.randint(1000, 9999)}"

    # 3. Zahaszuj hasło
    hashed_pwd = get_password_hash(data.password)

    # 4. TRANSAKCJA (Twoja dobra logika)
    try:
        # A. Tworzymy sklep
        new_tenant = Tenant(
            company_name=data.company_name,
            subdomain=generated_subdomain,
            is_active=True
        )
        db.add(new_tenant)
        db.flush() # Pobieramy ID

        # B. Tworzymy Usera
        new_user = User(
            email=data.email,
            hashed_password=hashed_pwd,
            role="OWNER",
            tenant_id=new_tenant.tenant_id,
            is_active=True
        )
        db.add(new_user)
        
        db.commit() # Zatwierdzamy całość
        return {"msg": "Konto założone pomyślnie", "tenant_id": new_tenant.tenant_id}

    except Exception as e:
        db.rollback() # Jak coś pójdzie nie tak, cofamy zmiany
        print(f"Błąd rejestracji: {e}")
        raise HTTPException(status_code=500, detail="Błąd serwera podczas rejestracji.")


# --- LOGOWANIE (JSON) ---
@router.post("/login", response_model=Token)
def login_for_access_token(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Zmieniliśmy OAuth2PasswordRequestForm na LoginRequest (JSON), żeby React działał
    
    # 1. Szukamy usera
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # 2. Weryfikacja
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niepoprawny email lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generujemy token
    access_token_expires = timedelta(minutes=60) # Wydłużyłem do godziny
    
    # Wkładamy tenant_id do tokena, żeby Frontend wiedział czyj to sklep!
    access_token = create_access_token(
        data={
            "sub": user.email,          # Standardowo w 'sub' daje się identyfikator (email)
            "user_id": user.user_id,    # Dodatkowo ID usera
            "tenant_id": user.tenant_id,# Dodatkowo ID sklepu
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}