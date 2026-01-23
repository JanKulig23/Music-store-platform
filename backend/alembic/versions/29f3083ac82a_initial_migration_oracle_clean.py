"""Initial migration Oracle Clean

Revision ID: 29f3083ac82a
Revises: 
Create Date: 2026-01-03 02:01:41.492185

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29f3083ac82a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- GLOBAL PRODUCTS ---
    op.create_table('global_products',
        sa.Column('global_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('base_description', sa.Text(), nullable=True),
        sa.Column('ean_code', sa.String(length=20), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('global_id')
    )
    op.create_index(op.f('ix_global_products_category'), 'global_products', ['category'], unique=False)
    op.create_index(op.f('ix_global_products_ean_code'), 'global_products', ['ean_code'], unique=True)

    # --- TENANTS ---
    op.create_table('tenants',
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(length=100), nullable=False),
        sa.Column('subdomain', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('tenant_id')
    )
    op.create_index(op.f('ix_tenants_subdomain'), 'tenants', ['subdomain'], unique=True)

    # --- PRODUCTS ---
    op.create_table('products',
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('global_ref_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sku', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['global_ref_id'], ['global_products.global_id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.tenant_id'], ),
        sa.PrimaryKeyConstraint('product_id')
    )
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=False)
    op.create_index(op.f('ix_products_tenant_id'), 'products', ['tenant_id'], unique=False)

    # --- STORES ---
    op.create_table('stores',
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('address', sa.String(length=200), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.tenant_id'], ),
        sa.PrimaryKeyConstraint('store_id')
    )
    op.create_index(op.f('ix_stores_tenant_id'), 'stores', ['tenant_id'], unique=False)

    # --- INVENTORY ---
    op.create_table('inventory',
        sa.Column('inventory_id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ),
        sa.ForeignKeyConstraint(['store_id'], ['stores.store_id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.tenant_id'], ),
        sa.PrimaryKeyConstraint('inventory_id')
    )

def downgrade() -> None:
    op.drop_table('inventory')
    op.drop_table('stores')
    op.drop_table('products')
    op.drop_table('tenants')
    op.drop_table('global_products')