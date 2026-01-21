from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- 1. ELEMENT ZAMÓWIENIA (POZYCJA) ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

# --- 2. ZAMÓWIENIE ZALOGOWANEGO UŻYTKOWNIKA (INPUT) ---
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

# --- 3. ZAMÓWIENIE GOŚCIA (INPUT) ---
class GuestOrderCreate(BaseModel):
    email: EmailStr
    tenant_id: int
    items: List[OrderItemCreate]

# --- 4. SCHEMATY ODPOWIEDZI (RESPONSE) ---

# To jest to, co wysyłamy do frontendu wewnątrz zamówienia
class OrderItemResponse(BaseModel):
    item_id: int
    product_id: int  # Zmieniono z product_name na product_id (bo to mamy w bazie)
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

# To jest główne zamówienie, które widzi właściciel
class OrderResponse(BaseModel):
    order_id: int
    tenant_id: int
    user_id: int
    total_amount: float
    status: str
    
    # NAPRAWA BŁĘDU: Pozwalamy na datę lub brak daty (None)
    created_at: Optional[datetime] = None 
    
    # Lista pozycji (opcjonalnie, ale warto mieć)
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True