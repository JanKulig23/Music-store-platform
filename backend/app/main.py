from fastapi import FastAPI
# Importujemy router z modułu tenancy
from app.modules.tenancy.router import router as tenancy_router
from app.modules.catalog.router import router as catalog_router
from app.modules.inventory.router import router as inventory_router
from app.modules.sales.router import router as sales_router

app = FastAPI(
    title="Music Store SaaS Platform",
    description="Backend API dla platformy SaaS sklepu muzycznego",
    version="0.1.0"
)

# Rejestracja routerów
app.include_router(tenancy_router)
app.include_router(catalog_router)
app.include_router(inventory_router)
app.include_router(sales_router)

@app.get("/")
def read_root():
    return {"message": "System działa! Witaj w Music Store SaaS."}

@app.get("/health")
def health_check():
    return {"status": "ok"}