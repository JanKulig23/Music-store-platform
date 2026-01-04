from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.tenancy.models import Tenant, User
from app.modules.auth.schemas import RegisterRequest, UserResponse
from app.core.security import get_password_hash
from fastapi.security import OAuth2PasswordRequestForm
from app.modules.auth.schemas import RegisterRequest, UserResponse, Token 
from app.core.security import get_password_hash, verify_password, create_access_token 

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_tenant_and_user(data: RegisterRequest, db: Session = Depends(get_db)):
    
    # 1. Sprawdź, czy taki email lub subdomena już nie istnieją
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ten email jest już zajęty.")
    
    existing_subdomain = db.query(Tenant).filter(Tenant.subdomain == data.subdomain).first()
    if existing_subdomain:
        raise HTTPException(status_code=400, detail="Ta subdomena jest już zajęta.")

    # 2. Zahaszuj hasło
    hashed_pwd = get_password_hash(data.password)

    # 3. ROZPOCZYNAMY TRANSAKCJĘ
    # Najpierw tworzymy sklep (Tenant)
    new_tenant = Tenant(
        company_name=data.company_name,
        subdomain=data.subdomain,
        is_active=True
    )
    db.add(new_tenant)
    db.flush()  # To ważne! Flush wysyła dane do bazy, żeby Oracle nadał ID, ale jeszcze nie kończy transakcji.
    
    # Teraz mamy już new_tenant.tenant_id, więc tworzymy Usera
    new_user = User(
        email=data.email,
        hashed_password=hashed_pwd,
        role="OWNER",
        tenant_id=new_tenant.tenant_id, # Powiązanie!
        is_active=True
    )
    db.add(new_user)
    
    # 4. Zapisujemy wszystko na stałe
    try:
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback() # Jak coś pójdzie nie tak, cofamy wszystko (i sklep i usera)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # 1. Szukamy użytkownika po emailu (form_data.username to u nas email)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Sprawdzamy czy user istnieje i czy hasło pasuje
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niepoprawny email lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Jeśli wszystko OK, generujemy token
    # W tokenie zaszywamy ID użytkownika i ID jego sklepu (sub i tenant_id)
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.user_id), "tenant_id": user.tenant_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}