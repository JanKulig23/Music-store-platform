from pydantic import BaseModel
from typing import Optional

# --- GLOBALNE ---
class GlobalProductCreate(BaseModel):
    name: str
    base_description: Optional[str] = None
    ean_code: str
    category: str

class GlobalProductResponse(GlobalProductCreate):
    global_id: int
    class Config:
        from_attributes = True

# --- LOKALNE (DLA TENANTA) ---
class ProductCreate(BaseModel):
    tenant_id: int          # W przyszłości weźmiemy to z tokena JWT, na razie podajemy ręcznie
    global_ref_id: Optional[int] = None
    name: str
    price: float
    description: Optional[str] = None
    sku: str

class ProductResponse(ProductCreate):
    product_id: int
    class Config:
        from_attributes = True