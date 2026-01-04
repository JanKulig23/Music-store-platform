from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    subdomain = Column(String(50), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    # Relacja do użytkowników (Jeden Tenant ma wielu Użytkowników - np. pracowników)
    users = relationship("User", back_populates="tenant")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False) # Tu będzie 'krzaczek', nie jawne hasło
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="OWNER") # OWNER, STAFF, ADMIN
    
    # Klucz obcy - User należy do konkretnego Tenanta (Sklepu)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    
    tenant = relationship("Tenant", back_populates="users")