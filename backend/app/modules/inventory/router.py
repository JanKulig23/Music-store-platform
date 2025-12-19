from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.inventory import models, schemas
from app.modules.catalog.models import Product  # Potrzebne do pobrania nazwy produktu

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory (Magazyn)"]
)

# 1. Dodaj nową lokalizację (np. Sklep w Warszawie)
@router.post("/stores/", response_model=schemas.StoreResponse)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    new_store = models.Store(**store.dict())
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store

# 2. Ustaw stan magazynowy (Przyjęcie towaru)
@router.post("/stock/", response_model=schemas.StockResponse)
def update_stock(stock_data: schemas.StockUpdate, db: Session = Depends(get_db)):
    # Sprawdź czy taki wpis już istnieje
    inventory_item = db.query(models.Inventory).filter(
        models.Inventory.store_id == stock_data.store_id,
        models.Inventory.product_id == stock_data.product_id
    ).first()

    if inventory_item:
        # Aktualizacja istniejącego
        inventory_item.quantity = stock_data.quantity
    else:
        # Tworzenie nowego wpisu
        inventory_item = models.Inventory(
            tenant_id=stock_data.tenant_id,
            store_id=stock_data.store_id,
            product_id=stock_data.product_id,
            quantity=stock_data.quantity
        )
        db.add(inventory_item)
    
    db.commit()
    db.refresh(inventory_item)
    
    # Pobieramy dodatkowe nazwy do wyświetlenia w odpowiedzi
    product_name = db.query(Product).filter(Product.product_id == stock_data.product_id).first().name
    store_name = db.query(models.Store).filter(models.Store.store_id == stock_data.store_id).first().name

    return schemas.StockResponse(
        inventory_id=inventory_item.inventory_id,
        quantity=inventory_item.quantity,
        product_name=product_name,
        store_name=store_name
    )

# 3. Sprawdź dostępność towaru w danej sieci sklepów
@router.get("/{tenant_id}/availability/{product_id}")
def check_availability(tenant_id: int, product_id: int, db: Session = Depends(get_db)):
    # Zwraca listę sklepów, gdzie ten towar jest dostępny (>0 sztuk)
    results = db.query(models.Inventory, models.Store).join(models.Store)\
        .filter(models.Inventory.product_id == product_id)\
        .filter(models.Inventory.tenant_id == tenant_id)\
        .filter(models.Inventory.quantity > 0).all()
        
    return [
        {"store": store.name, "city": store.city, "quantity": inv.quantity}
        for inv, store in results
    ]