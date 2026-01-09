from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text
from datetime import datetime
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    subdomain = Column(String(50), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    # Relacja do użytkowników
    users = relationship("User", back_populates="tenant")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="OWNER") # OWNER, STAFF, ADMIN
    
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    
    tenant = relationship("Tenant", back_populates="users")


# --- NOWE KLASY (ZAMÓWIENIA) ---

class StoreOrder(Base):
    __tablename__ = "store_orders"

    order_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    total_amount = Column(Float, default=0.0) # Tu przechowujemy sumę zamówienia
    status = Column(String(20), default="NEW") # NEW, PAID, SENT
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacja: Jedno zamówienie ma wiele pozycji
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.order_id"), index=True)
    
    # Uwaga: products.product_id odnosi się do tabeli z innego modułu, 
    # ale w bazie danych to zadziała, jeśli tabela 'products' istnieje.
    product_id = Column(Integer, ForeignKey("products.product_id")) 
    
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False) # Cena w momencie zakupu (gdyby potem zdrożało)

    # Relacja zwrotna do zamówienia
    order = relationship("StoreOrder", back_populates="items")