from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# 1. IMPORTY
from app.core.database import SQLALCHEMY_DATABASE_URL, Base
# Importujemy modele
from app.modules.tenancy.models import Tenant, User
from app.modules.catalog.models import Product
from app.modules.inventory.models import Inventory
from app.modules.sales.models import StoreOrder 

config = context.config

# 2. KONFIGURACJA URL
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# --- NOWA FUNKCJA FILTRUJĄCA ---
def include_object(object, name, type_, reflected, compare_to):
    # Ignoruj tabele systemowe Oracle (zaczynające się od LOGMNR, MVIEW, itp.)
    if type_ == "table" and name and name.upper().startswith(("LOGMNR", "MVIEW", "AQ$", "DEF$", "REPCAT$", "OL$", "WRI$", "LOGSTDBY")):
        return False
    # Ignoruj tabelę migracji samego Alembica (żeby sam siebie nie zjadł)
    if name == "alembic_version":
        return True
    return True
# -------------------------------

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object  # <-- DODANO TUTAJ
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            include_object=include_object # <-- I DODANO TUTAJ
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()