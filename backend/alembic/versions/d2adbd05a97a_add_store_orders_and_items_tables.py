"""Add store orders and items tables

Revision ID: d2adbd05a97a
Revises: 9ebefede9ee5
Create Date: 2026-01-09 23:37:34.344055

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2adbd05a97a'
down_revision: Union[str, Sequence[str], None] = '9ebefede9ee5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    
    # --- TWORZENIE TABELI ZAMÓWIEŃ (STORE_ORDERS) ---
    op.create_table('store_orders',
        # TU ZMIANA: Dodano sa.Identity(start=1) - to włącza autoincrement w Oracle
        sa.Column('order_id', sa.Integer(), sa.Identity(start=1), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.tenant_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('order_id')
    )
    # Oracle sam tworzy indeks dla Primary Key, więc nie dodajemy go ręcznie dla order_id

    # --- TWORZENIE TABELI POZYCJI ZAMÓWIENIA (ORDER_ITEMS) ---
    op.create_table('order_items',
        # TU ZMIANA: Dodano sa.Identity(start=1)
        sa.Column('item_id', sa.Integer(), sa.Identity(start=1), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['store_orders.order_id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ),
        sa.PrimaryKeyConstraint('item_id')
    )
    # Oracle sam tworzy indeks dla Primary Key (item_id)
    
    # Indeks dla klucza obcego (relacji) jest potrzebny:
    op.create_index(op.f('ix_order_items_order_id'), 'order_items', ['order_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_order_items_order_id'), table_name='order_items')
    op.drop_table('order_items')
    op.drop_table('store_orders')