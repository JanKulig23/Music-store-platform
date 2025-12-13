from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base

class Tenant(Base):
    """
    Model reprezentujący Firmę (Sieć Sklepów) w systemie SaaS.
    Odzwierciedla tabelę TENANTS z raportu.
    """
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    # Subdomena identyfikuje tenanta (np. 'sklep1'.platforma.pl)
    subdomain = Column(String(50), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Data utworzenia (automatycznie ustawiana przez bazę)
    created_at = Column(TIMESTAMP, server_default=func.now())