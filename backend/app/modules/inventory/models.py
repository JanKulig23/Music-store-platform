from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Store(Base):
    """
    Fizyczna lokalizacja sklepu/magazynu (np. Salon Kraków).
    Zgodnie z raportem (5.2.4), Tenant może mieć wiele lokalizacji.
    """
    __tablename__ = "stores"

    store_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False, index=True)
    
    name = Column(String(100), nullable=False) 
    city = Column(String(100), nullable=False)
    address = Column(String(200))

class Inventory(Base):
    """
    Tabela łącząca Produkt ze Sklepem.
    Przechowuje informację: "W sklepie X jest Y sztuk produktu Z".
    """
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False) 
    
    store_id = Column(Integer, ForeignKey("stores.store_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    
    quantity = Column(Integer, default=0, nullable=False) # Ilość sztuk