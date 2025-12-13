from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class GlobalProduct(Base):
    """
    Tabela GLOBAL_PRODUCTS - Wzorcowa baza instrumentów.
    Zgodnie z raportem, zawiera opisy i zdjęcia wspólne dla wszystkich tenantów.
    """
    __tablename__ = "global_products"

    global_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    # Text to typ dla długich opisów (CLOB w Oracle)
    base_description = Column(Text, nullable=True)
    # Kod EAN (kreskowy) - unikalny identyfikator produktu
    ean_code = Column(String(20), unique=True, index=True)
    category = Column(String(50), index=True) # np. 'Gitary', 'Perkusje'