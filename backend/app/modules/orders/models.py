from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class StoreOrder(Base):
    __tablename__ = "store_orders"

    order_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False) # ID Sklepu
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) # Kto kupił
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="NEW") # NEW, PAID, SHIPPED
    
    # Zmieniamy to na datetime.now, żeby pasowało do logiki w routerze (którą naprawialiśmy wcześniej)
    created_at = Column(DateTime, default=datetime.now)

    # --- NOWE KOLUMNY (DANE ADRESOWE) ---
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    # ------------------------------------

    # Relacja z pozycjami zamówienia
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.order_id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) # Cena w momencie zakupu

    order = relationship("StoreOrder", back_populates="items")