import time
import sys
import os
from datetime import datetime
from sqlalchemy import create_engine, text

# --- KONFIGURACJA ---
# Adres bazy danych zgodny z Twoim docker-compose.yml:
# User: system
# Hasło: SecretPassword123
# Host: database (nazwa serwisu w docker-compose)
# SID: xepdb1
DATABASE_URL = "oracle+oracledb://system:SecretPassword123@database:1521/?service_name=xepdb1"

def get_db_engine():
    try:
        # Tworzymy połączenie niezależnie od FastAPI
        engine = create_engine(DATABASE_URL)
        return engine
    except Exception as e:
        print(f"[Worker BŁĄD] Nie można utworzyć engine: {e}", file=sys.stderr)
        return None

def generate_report():
    engine = get_db_engine()
    if not engine:
        return

    print(f"[Worker] ⚙️ Rozpoczynam audyt magazynu...", file=sys.stdout)

    try:
        with engine.connect() as connection:
            # 1. Pobieramy statystyki dla sklepu (Tenant ID = 2)
            # Liczymy: ilość produktów, sumę sztuk, łączną wartość
            stats_sql = text("""
                SELECT 
                    COUNT(*) as count_prod,
                    SUM(stock_quantity) as sum_stock,
                    SUM(price * stock_quantity) as total_val
                FROM products 
                WHERE tenant_id = 2
            """)
            result = connection.execute(stats_sql).fetchone()
            
            # Zabezpieczenie przed NULL (gdyby baza była pusta)
            count_prod = result[0] or 0
            sum_stock = result[1] or 0
            total_val = result[2] or 0

            # 2. Szukamy produktów wyprzedanych (Stock = 0)
            zeros_sql = text("""
                SELECT name, sku 
                FROM products 
                WHERE tenant_id = 2 AND stock_quantity = 0
            """)
            out_of_stock = connection.execute(zeros_sql).fetchall()

            # --- GENEROWANIE TREŚCI ---
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            lines = []
            lines.append(f"====== RAPORT MAGAZYNOWY [{now}] ======")
            lines.append(f"📊 Produkty w bazie: {count_prod}")
            lines.append(f"📦 Łącznie sztuk:    {sum_stock}")
            lines.append(f"💰 Wartość towaru:   {total_val:,.2f} PLN")
            lines.append("-" * 40)
            
            if out_of_stock:
                lines.append(f"⚠️ UWAGA! BRAKI MAGAZYNOWE ({len(out_of_stock)}):")
                for prod in out_of_stock:
                    lines.append(f"   ❌ {prod[0]} (SKU: {prod[1]})")
            else:
                lines.append("✅ Stan magazynowy optymalny. Brak wyprzedanych towarów.")
            
            lines.append("=" * 40)
            report_content = "\n".join(lines)

            # --- WYPISANIE WYNIKÓW ---
            
            # A. Na konsolę (widoczne w: docker-compose logs -f backend-worker)
            print(report_content, file=sys.stdout)

            # B. Do pliku tekstowego
            # Plik pojawi się w Twoim folderze backend/raporty_worker.txt na komputerze
            # Tryb 'a' oznacza APPEND (dopisywanie), więc historia nie zginie.
            with open("/app/raporty_worker.txt", "a", encoding="utf-8") as f:
                f.write(report_content + "\n\n")

    except Exception as e:
        print(f"[Worker BŁĄD] W trakcie analizy danych: {e}", file=sys.stderr)

def start():
    print("--- 🚀 URUCHAMIANIE WORKERA TŁA (Backend/App) ---", file=sys.stdout)
    print(f"Baza danych: {DATABASE_URL}", file=sys.stdout)
    
    # Czekamy chwilę na start bazy danych po uruchomieniu kontenerów
    time.sleep(10) 
    
    while True:
        generate_report()
        # Raport co 30 sekund
        print("[Worker] Czekam 30 sekund na kolejny cykl...", file=sys.stdout)
        time.sleep(30)

if __name__ == "__main__":
    start()