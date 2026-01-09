from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.tenancy.models import User, StoreOrder, OrderItem
from app.modules.catalog.models import Product
from app.modules.orders.schemas import OrderCreate

router = APIRouter(
    prefix="/orders",
    tags=["Orders (Zamówienia)"]
)

@router.post("/", status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    # 1. Obliczamy sumę zamówienia (zabezpieczenie - ceny bierzemy z bazy, nie z JSONa)
    total_price = 0.0
    valid_items = [] # Tu będziemy zbierać pary (produkt_db, ilosc)

    for item in order_data.items:
        product_db = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product_db:
            raise HTTPException(status_code=404, detail=f"Produkt o ID {item.product_id} nie istnieje")
        
        # Sprawdzamy, czy produkt należy do tego samego sklepu co użytkownik (opcjonalne, ale dobre)
        if product_db.tenant_id != current_user.tenant_id:
             raise HTTPException(status_code=400, detail="Nie możesz kupić produktu z innego sklepu!")

        item_total = product_db.price * item.quantity
        total_price += item_total
        valid_items.append((product_db, item.quantity))

    # 2. Tworzymy zamówienie (StoreOrder)
    new_order = StoreOrder(
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id,
        total_amount=total_price,
        status="NEW",
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.flush() # Żeby dostać new_order.order_id

    # 3. Tworzymy pozycje zamówienia (OrderItem)
    for product, qty in valid_items:
        new_item = OrderItem(
            order_id=new_order.order_id,
            product_id=product.product_id,
            quantity=qty,
            unit_price=product.price 
        )
        db.add(new_item)

    # 4. Zatwierdzamy transakcję
    db.commit()
    
    return {"msg": "Zamówienie złożone!", "order_id": new_order.order_id, "total": total_price}