from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class StoreOrder(Base):
    """
    Nagłówek zamówienia. Reprezentuje transakcję zakupu.
    """
    __tablename__ = "store_orders"

    order_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    
    # Kto kupił (proste pola tekstowe na potrzeby MVP)
    customer_email = Column(String(100), nullable=False)
    status = Column(String(20), default="NEW") # NEW, PAID, SHIPPED, COMPLETED
    
    # Kiedy zamówił
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Łączna kwota do zapłaty
    total_amount = Column(Float, default=0.0)

    # Relacja do pozycji zamówienia
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    """
    Pozycja na paragonie/fakturze.
    """
    __tablename__ = "order_items"

    item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.order_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) # Cena w momencie zakupu (bo cena produktu może się zmienić jutro)

    order = relationship("StoreOrder", back_populates="items")