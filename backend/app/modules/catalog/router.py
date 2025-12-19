from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.catalog import models, schemas

router = APIRouter(
    prefix="/catalog",
    tags=["Catalog (Produkty)"]
)

# --- ENDPOINTY GLOBALNE (ADMIN) ---

@router.post("/global/", response_model=schemas.GlobalProductResponse)
def create_global_product(product: schemas.GlobalProductCreate, db: Session = Depends(get_db)):
    # Sprawdź czy EAN już istnieje
    if db.query(models.GlobalProduct).filter(models.GlobalProduct.ean_code == product.ean_code).first():
        raise HTTPException(status_code=400, detail="Produkt z tym kodem EAN już istnieje w bazie globalnej")
    
    new_gp = models.GlobalProduct(**product.dict())
    db.add(new_gp)
    db.commit()
    db.refresh(new_gp)
    return new_gp

@router.get("/global/", response_model=list[schemas.GlobalProductResponse])
def get_global_products(db: Session = Depends(get_db)):
    return db.query(models.GlobalProduct).all()

# --- ENDPOINTY LOKALNE (TENANT) ---

@router.post("/local/", response_model=schemas.ProductResponse)
def create_local_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Tutaj Tenant tworzy ofertę w swoim sklepie
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/local/{tenant_id}", response_model=list[schemas.ProductResponse])
def get_tenant_products(tenant_id: int, db: Session = Depends(get_db)):
    # Zwraca produkty TYLKO tego jednego sklepu (zalążek izolacji danych)
    return db.query(models.Product).filter(models.Product.tenant_id == tenant_id).all()