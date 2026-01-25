from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
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
    current_user: User = Depends(get_current_user) 
):
    if db.query(models.GlobalProduct).filter(models.GlobalProduct.ean_code == product.ean_code).first():
        raise HTTPException(status_code=400, detail="Produkt z tym kodem EAN już istnieje w bazie globalnej")
    
    new_gp = models.GlobalProduct(**product.dict())
    db.add(new_gp)
    db.commit()
    db.refresh(new_gp)
    return new_gp

# ZMIANA: Dodano paginację i wyszukiwanie (analogicznie do local)
@router.get("/global/")
def get_global_products(
    page: int = 1, 
    limit: int = 20,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    
    # 1. Budujemy zapytanie
    query = db.query(models.GlobalProduct)
    
    # 2. Wyszukiwanie (jeśli podano parametr search)
    if search:
        search_fmt = f"%{search}%"
        # Szukamy po nazwie LUB kodzie EAN
        query = query.filter(
            (models.GlobalProduct.name.ilike(search_fmt)) | 
            (models.GlobalProduct.ean_code.ilike(search_fmt))
        )

    # 3. Liczymy całkowitą ilość (do paginacji)
    total_count = query.count()
    
    # 4. Pobieramy wycinek
    products = query.offset(skip).limit(limit).all()
    
    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "products": products
    }

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
    
    # Jeśli frontend nie wysłał stock_quantity, upewniamy się, że jest 0 (lub to co w modelu)
    if 'stock_quantity' not in product_data:
        product_data['stock_quantity'] = 0

    new_product = models.Product(**product_data)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/local/{tenant_id}")
def get_tenant_products(
    tenant_id: int, 
    page: int = 1, 
    limit: int = 20,
    search: Optional[str] = None,
    sort_by: str = "newest",  # <--- Opcje: newest, price, name
    sort_order: str = "asc",  # <--- Opcje: asc, desc
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    
    # 1. Budujemy zapytanie bazowe
    query = db.query(models.Product).filter(models.Product.tenant_id == tenant_id)
    
    # 2. Wyszukiwanie (Search)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_fmt)) | 
            (models.Product.sku.ilike(search_fmt))
        )
    
    # 3. Sortowanie (Sorting) <--- NOWOŚĆ
    if sort_by == "price":
        if sort_order == "desc":
            query = query.order_by(models.Product.price.desc())
        else:
            query = query.order_by(models.Product.price.asc())
            
    elif sort_by == "name":
        if sort_order == "desc":
            query = query.order_by(models.Product.name.desc())
        else:
            query = query.order_by(models.Product.name.asc())
            
    else: # Domyślnie "newest" (po ID)
        query = query.order_by(models.Product.product_id.desc())

    # 4. Liczenie i Paginacja
    total_count = query.count()
    products = query.offset(skip).limit(limit).all()
        
    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "products": products
    }


# --- EDYCJA PRODUKTÓW (ZMIANA CENY, OPISU I STANU) ---

# Zaktualizowany schemat do aktualizacji
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    stock_quantity: Optional[int] = None # <--- NOWOŚĆ: Pole do edycji stanu

@router.patch("/local/{product_id}")
def update_product(
    product_id: int, 
    product_data: ProductUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Szukamy produktu w bazie
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    
    # 2. Sprawdzamy czy istnieje
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nie istnieje")
        
    # 3. BEZPIECZEŃSTWO: Izolacja Tenantów!
    # Sprawdzamy czy ten produkt należy do tego sklepu, którego właścicielem jest user.
    if product.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Nie możesz edytować cudzych produktów!")

    # 4. Aktualizujemy pola, jeśli zostały przesłane (PATCH)
    if product_data.name is not None:
        product.name = product_data.name
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.description is not None:
        product.description = product_data.description
    
    # <--- NOWOŚĆ: Aktualizacja stanu magazynowego
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity

    db.commit()
    db.refresh(product)
    return product