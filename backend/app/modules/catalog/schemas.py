from pydantic import BaseModel
from typing import Optional

# --- PRODUKTY GLOBALNE (HURTOWNIA) ---
class GlobalProductBase(BaseModel):
    name: str
    base_description: Optional[str] = None
    ean_code: Optional[str] = None
    category: Optional[str] = None

class GlobalProductCreate(GlobalProductBase):
    pass

class GlobalProductResponse(GlobalProductBase):
    global_id: int

    class Config:
        from_attributes = True


# --- PRODUKTY LOKALNE (SKLEPOWE) ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    sku: Optional[str] = None
    # NOWOŚĆ: Dodajemy stan magazynowy (domyślnie 0)
    stock_quantity: int = 0  

class ProductCreate(ProductBase):
    tenant_id: int 
    global_ref_id: Optional[int] = None 

class ProductResponse(ProductBase):
    product_id: int
    tenant_id: int
    global_ref_id: Optional[int] = None
    # NOWOŚĆ: API zwróci stan magazynowy do Frontendu
    stock_quantity: int  

    class Config:
        from_attributes = True