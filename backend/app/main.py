from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  
from app.modules.tenancy.router import router as tenancy_router
from app.modules.catalog.router import router as catalog_router
from app.modules.inventory.router import router as inventory_router
from app.modules.auth.router import router as auth_router
from app.modules.orders.router import router as orders_router

app = FastAPI(
    title="Music Store SaaS Platform",
    description="Backend API dla platformy SaaS sklepu muzycznego",
    version="0.1.0"
)

# --- KONFIGURACJA CORS (To pozwala Reactowi łączyć się z API) ---
origins = [
    "http://localhost:3000",  # Adres naszego Frontendu
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # Zostawmy na wszelki wypadek (dla deweloperki lokalnej)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Pozwalamy na wszystkie metody (GET, POST, etc.)
    allow_headers=["*"],
)
# -------------------------------------------------------------

# Rejestracja routerów
app.include_router(tenancy_router)
app.include_router(catalog_router)
app.include_router(inventory_router)
app.include_router(auth_router)
app.include_router(orders_router)

@app.get("/")
def read_root():
    return {"message": "System działa! Witaj w Music Store SaaS."}

@app.get("/health")
def health_check():
    return {"status": "ok"}