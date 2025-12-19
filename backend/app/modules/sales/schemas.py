from pydantic import BaseModel
from typing import List

# Pojedyncza pozycja w koszyku
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

# Całe zamówienie wysyłane przez klienta
class OrderCreate(BaseModel):
    tenant_id: int
    store_id: int       # Z którego magazynu realizujemy (dla Click & Collect)
    customer_email: str
    items: List[OrderItemCreate]

# Odpowiedź systemu po złożeniu zamówienia
class OrderResponse(BaseModel):
    order_id: int
    status: str
    total_amount: float
    message: str

    class Config:
        from_attributes = True