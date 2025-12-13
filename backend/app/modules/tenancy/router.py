from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.tenancy import models, schemas

# Tworzymy router dla modułu Tenancy
router = APIRouter(
    prefix="/tenants",
    tags=["Tenancy (Zarządzanie Firmami)"]
)

# POST /tenants/ - Rejestracja nowej firmy
@router.post("/", response_model=schemas.TenantResponse)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    # 1. Sprawdź czy subdomena jest wolna
    db_tenant = db.query(models.Tenant).filter(models.Tenant.subdomain == tenant.subdomain).first()
    if db_tenant:
        raise HTTPException(status_code=400, detail="Ta subdomena jest już zajęta!")
    
    # 2. Utwórz obiekt bazy danych
    new_tenant = models.Tenant(
        company_name=tenant.company_name,
        subdomain=tenant.subdomain
    )
    
    # 3. Zapisz w bazie
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    
    return new_tenant

# GET /tenants/ - Lista wszystkich firm (dla nas, administratorów)
@router.get("/", response_model=list[schemas.TenantResponse])
def read_tenants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tenants = db.query(models.Tenant).offset(skip).limit(limit).all()
    return tenants