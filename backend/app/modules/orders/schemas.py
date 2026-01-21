from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- 1. ELEMENT ZAMÓWIENIA (POZYCJA) ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

# --- 2. DANE KLIENTA (WSPÓLNE POLA) ---
# Tworzymy to raz, żeby nie pisać w kółko tego samego
class CustomerDetails(BaseModel):
    first_name: str
    last_name: str
    address: str
    phone_number: str

# --- 3. ZAMÓWIENIE ZALOGOWANEGO UŻYTKOWNIKA (INPUT) ---
# Dziedziczy dane klienta (imię, adres) + listę zakupów
class OrderCreate(CustomerDetails):
    items: List[OrderItemCreate]

# --- 4. ZAMÓWIENIE GOŚCIA (INPUT) ---
# Dziedziczy dane klienta + email + tenant_id + listę zakupów
class GuestOrderCreate(CustomerDetails):
    email: EmailStr
    tenant_id: int
    items: List[OrderItemCreate]

# --- 5. SCHEMATY ODPOWIEDZI (RESPONSE) ---

class OrderItemResponse(BaseModel):
    item_id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

# To widzi właściciel w panelu
class OrderResponse(BaseModel):
    order_id: int
    tenant_id: int
    user_id: int
    total_amount: float
    status: str
    created_at: Optional[datetime] = None
    
    # --- NOWE POLA W ODPOWIEDZI ---
    # Dzięki temu właściciel zobaczy te dane w tabelce
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True