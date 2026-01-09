from pydantic import BaseModel
from typing import List

# Pojedyncza pozycja na paragonie (np. 2x Fender Stratocaster)
class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int

# Całe zamówienie wysyłane przez frontend
class OrderCreate(BaseModel):
    items: List[OrderItemSchema]