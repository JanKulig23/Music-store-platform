from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class GlobalProduct(Base):
    """
    Katalog Globalny (Master Data).
    Wspólny dla wszystkich sklepów.
    """
    __tablename__ = "global_products"

    global_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    base_description = Column(Text, nullable=True)
    ean_code = Column(String(20), unique=True, index=True)
    category = Column(String(50), index=True)

class Product(Base):
    """
    Katalog Lokalny (Oferta Tenanta).
    To są produkty widoczne w konkretnym sklepie (tenant_id).
    Mogą dziedziczyć z GlobalProduct (global_ref_id) lub być unikalne.
    """
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    # Klucz obcy do tabeli tenants - to wiąże produkt z konkretnym sklepem
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False, index=True)
    
    # Opcjonalne powiązanie z bazą globalną
    global_ref_id = Column(Integer, ForeignKey("global_products.global_id"), nullable=True)
    
    name = Column(String(150), nullable=False)  # Tenant może zmienić nazwę
    price = Column(Float, nullable=False)       # Własna cena Tenanta
    description = Column(Text, nullable=True)   # Własny opis
    sku = Column(String(50), index=True)        # Stock Keeping Unit (kod magazynowy)