import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from . import models, schemas
# Importujemy modele produktów i userów
from app.modules.catalog.models import Product
from app.modules.tenancy.models import User
from app.modules.auth.dependencies import get_current_user
from app.core.security import get_password_hash

router = APIRouter(
    prefix="/orders",
    tags=["Orders (Zamówienia)"]
)

# --- ZAMÓWIENIE DLA ZALOGOWANEGO UŻYTKOWNIKA ---
@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Obliczamy sumę
    total_amount = 0
    # Weryfikacja cen produktów
    for item in order_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produkt {item.product_id} nie istnieje")
        
        # Izolacja: sprawdzamy czy produkt należy do tego samego sklepu co user
        if product.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=400, detail="Produkt nie należy do tego sklepu")
            
        total_amount += product.price * item.quantity

    # 2. Tworzymy nagłówek zamówienia
    new_order = models.StoreOrder(
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id,
        total_amount=total_amount,
        status="NEW"
    )
    db.add(new_order)
    db.flush() # Pobieramy ID zamówienia

    # 3. Dodajemy pozycje
    for item in order_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        new_item = models.OrderItem(
            order_id=new_order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(new_item)

    db.commit()
    db.refresh(new_order)
    return new_order


# --- ZAMÓWIENIE DLA GOŚCIA (BEZ LOGOWANIA) ---
@router.post("/guest", status_code=201)
def create_guest_order(order_data: schemas.GuestOrderCreate, db: Session = Depends(get_db)):
    # 1. Sprawdzamy, czy użytkownik o takim emailu już istnieje
    user = db.query(User).filter(User.email == order_data.email).first()
    
    # 2. Jeśli nie istnieje -> Tworzymy konto "Automatycznego Klienta"
    if not user:
        # Generujemy losowe hasło (bo klient go nie zna, ale baza wymaga hasła)
        chars = string.ascii_letters + string.digits
        random_password = ''.join(random.choice(chars) for i in range(12))
        
        user = User(
            email=order_data.email,
            hashed_password=get_password_hash(random_password),
            role="CUSTOMER", # Klient
            tenant_id=order_data.tenant_id,
            is_active=True
        )
        db.add(user)
        db.flush() # Żeby dostać user.user_id

    # 3. Obliczamy sumę zamówienia
    total_amount = 0
    # Weryfikacja cen
    for item in order_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produkt {item.product_id} nie istnieje")
        
        # Sprawdzamy czy produkt należy do sklepu, w którym kupuje gość
        if product.tenant_id != order_data.tenant_id:
             raise HTTPException(status_code=400, detail="Produkt nie należy do tego sklepu")

        total_amount += product.price * item.quantity

    # 4. Tworzymy zamówienie przypisane do tego usera (istniejącego lub nowego)
    new_order = models.StoreOrder(
        tenant_id=order_data.tenant_id,
        user_id=user.user_id, # <--- Tu wpada ID
        total_amount=total_amount,
        status="NEW"
    )
    db.add(new_order)
    db.flush() 

    # 5. Dodajemy pozycje zamówienia
    for item in order_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        new_item = models.OrderItem(
            order_id=new_order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(new_item)

    db.commit()
    return {"msg": "Zamówienie przyjęte (Gość)", "order_id": new_order.order_id}

@router.get("/", response_model=list[schemas.OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(models.StoreOrder).filter(models.StoreOrder.user_id == current_user.user_id).all()