from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.sales import models, schemas
# Importujemy modele innych modułów, bo musimy sprawdzać stany i ceny!
from app.modules.catalog.models import Product
from app.modules.inventory.models import Inventory

router = APIRouter(
    prefix="/sales",
    tags=["Sales (Zamówienia)"]
)

@router.post("/orders/", response_model=schemas.OrderResponse)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Proces składania zamówienia:
    1. Oblicz sumę zamówienia.
    2. Sprawdź dostępność towaru w magazynie.
    3. Pomniejsz stany magazynowe.
    4. Zapisz zamówienie.
    """
    total_cost = 0.0
    db_order_items = []

    # Rozpoczynamy transakcję (wszystko albo nic)
    try:
        # Tworzymy nagłówek zamówienia
        new_order = models.StoreOrder(
            tenant_id=order_data.tenant_id,
            customer_email=order_data.customer_email,
            status="NEW"
        )
        db.add(new_order)
        db.flush() # Żeby dostać ID zamówienia przed commitem

        for item in order_data.items:
            # A. Pobierz produkt (żeby znać aktualną cenę)
            product = db.query(Product).filter(Product.product_id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Produkt {item.product_id} nie istnieje")

            # B. Sprawdź stan magazynowy w wybranym sklepie
            inventory = db.query(Inventory).filter(
                Inventory.store_id == order_data.store_id,
                Inventory.product_id == item.product_id
            ).first()

            if not inventory or inventory.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Brak towaru {product.name} w magazynie! Dostępne: {inventory.quantity if inventory else 0}")

            # C. Zdejmij ze stanu (Rezerwacja)
            inventory.quantity -= item.quantity
            
            # D. Dodaj pozycję do zamówienia
            line_total = product.price * item.quantity
            total_cost += line_total
            
            db_item = models.OrderItem(
                order_id=new_order.order_id,
                product_id=product.product_id,
                quantity=item.quantity,
                unit_price=product.price
            )
            db.add(db_item)

        # Zapisz sumę i zatwierdź wszystko
        new_order.total_amount = total_cost
        db.commit()
        db.refresh(new_order)

        return schemas.OrderResponse(
            order_id=new_order.order_id,
            status=new_order.status,
            total_amount=new_order.total_amount,
            message="Zamówienie przyjęte pomyślnie!"
        )

    except Exception as e:
        db.rollback() # Cofnij zmiany jeśli coś poszło nie tak
        raise e