from datetime import timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr 
from app.core.database import get_db
from app.modules.tenancy.models import Tenant, User
from app.core.security import get_password_hash, verify_password, create_access_token


class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequestJSON(BaseModel):
    email: EmailStr
    password: str
    company_name: str


class Token(BaseModel):
    access_token: str
    token_type: str

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_tenant_and_user(data: RegisterRequestJSON, db: Session = Depends(get_db)):
    
    # 1. Sprawdź czy email jest wolny
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ten email jest już zajęty.")
    
    # 2. Generowanie unikalnej subdomeny z nazwy firmy

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



@router.post("/login", response_model=Token)
def login_for_access_token(login_data: LoginRequest, db: Session = Depends(get_db)):
    
    
    
    user = db.query(User).filter(User.email == login_data.email).first()
    
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niepoprawny email lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    access_token_expires = timedelta(minutes=60) 
    
    
    access_token = create_access_token(
        data={
            "sub": user.email,          
            "user_id": user.user_id,    
            "tenant_id": user.tenant_id,
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}