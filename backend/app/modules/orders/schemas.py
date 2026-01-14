from typing import List, Optional
from pydantic import BaseModel, EmailStr

# --- 1. NAJPIERW DEFINIUJEMY POJEDYNCZY ELEMENT ZAMÓWIENIA ---
# Musi być na górze, bo inne klasy z tego korzystają!
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

# --- 2. ZAMÓWIENIE ZALOGOWANEGO UŻYTKOWNIKA ---
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

# --- 3. ZAMÓWIENIE GOŚCIA (NOWE) ---
# Teraz Python już wie, co to jest OrderItemCreate, więc to zadziała
class GuestOrderCreate(BaseModel):
    email: EmailStr
    tenant_id: int
    items: List[OrderItemCreate]

# --- 4. SCHEMATY ODPOWIEDZI (RESPONSE) ---
class OrderItemResponse(BaseModel):
    product_name: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    order_id: int
    total_amount: float
    status: str
    created_at: str # lub datetime
    # items: List[OrderItemResponse] = [] # Opcjonalnie, jeśli chcesz zwracać szczegóły

    class Config:
        from_attributes = True