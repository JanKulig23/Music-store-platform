from pydantic import BaseModel

# --- SKLEPY (LOKALIZACJE) ---
class StoreCreate(BaseModel):
    tenant_id: int
    name: str
    city: str
    address: str

class StoreResponse(StoreCreate):
    store_id: int
    class Config:
        from_attributes = True

# --- ZMIANA STANU MAGAZYNOWEGO ---
class StockUpdate(BaseModel):
    tenant_id: int
    store_id: int
    product_id: int
    quantity: int   # Nowa ilość (np. ustawiamy na 50 sztuk)

class StockResponse(BaseModel):
    inventory_id: int
    quantity: int
    product_name: str
    store_name: str
    
    class Config:
        from_attributes = True