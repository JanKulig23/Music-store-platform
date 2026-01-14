from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class StoreOrder(Base):
    __tablename__ = "store_orders"

    order_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False) # ID Sklepu
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) # Kto kupił
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="NEW") # NEW, PAID, SHIPPED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacja z pozycjami zamówienia
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.order_id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) # Cena w momencie zakupu (zabezpieczenie przed zmianą cen)

    order = relationship("StoreOrder", back_populates="items")