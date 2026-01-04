from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.catalog import models, schemas
# Importujemy strażnika (funkcję sprawdzającą token) i model User
from app.modules.auth.dependencies import get_current_user
from app.modules.tenancy.models import User

router = APIRouter(
    prefix="/catalog",
    tags=["Catalog (Produkty)"]
)

# --- ENDPOINTY GLOBALNE ---

@router.post("/global/", response_model=schemas.GlobalProductResponse)
def create_global_product(
    product: schemas.GlobalProductCreate, 
    db: Session = Depends(get_db),
    # ZABEZPIECZENIE: Tylko zalogowany użytkownik może dodać produkt globalny
    current_user: User = Depends(get_current_user) 
):
    # Opcjonalnie: Tu można dodać sprawdzenie czy current_user.role == 'ADMIN'
    
    if db.query(models.GlobalProduct).filter(models.GlobalProduct.ean_code == product.ean_code).first():
        raise HTTPException(status_code=400, detail="Produkt z tym kodem EAN już istnieje w bazie globalnej")
    
    new_gp = models.GlobalProduct(**product.dict())
    db.add(new_gp)
    db.commit()
    db.refresh(new_gp)
    return new_gp

@router.get("/global/", response_model=list[schemas.GlobalProductResponse])
def get_global_products(db: Session = Depends(get_db)):
    # To zostawiamy publiczne, żeby każdy mógł przeglądać katalog producenta
    return db.query(models.GlobalProduct).all()


# --- ENDPOINTY LOKALNE (SKLEPOWE) ---

@router.post("/local/", response_model=schemas.ProductResponse)
def create_local_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    # ZABEZPIECZENIE: Pobieramy użytkownika z tokena
    current_user: User = Depends(get_current_user)
):
    # MAGIA SAAS:
    # Ignorujemy tenant_id przesłane w JSONie (nawet jak user wpisze tam ID sąsiada).
    # Nadpisujemy je ID sklepu, do którego należy zalogowany użytkownik.
    
    product_data = product.dict()
    product_data['tenant_id'] = current_user.tenant_id  # <--- TU JEST KLUCZ!
    
    new_product = models.Product(**product_data)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/local/{tenant_id}", response_model=list[schemas.ProductResponse])
def get_tenant_products(tenant_id: int, db: Session = Depends(get_db)):
    # Zwraca produkty sklepu - to może być publiczne dla klientów
    return db.query(models.Product).filter(models.Product.tenant_id == tenant_id).all()