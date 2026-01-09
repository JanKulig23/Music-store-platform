from sqlalchemy import text
from app.core.database import engine

def clean_tables():
    print("🧹 Czyszczenie starych tabel...")
    with engine.connect() as conn:
        # 1. Usuwamy order_items (jeśli istnieje)
        try:
            conn.execute(text("DROP TABLE order_items CASCADE CONSTRAINTS"))
            print("✅ Usunięto tabelę order_items")
        except Exception as e:
            print(f"ℹ️ Info: {e}")

        # 2. Usuwamy store_orders (jeśli istnieje)
        try:
            conn.execute(text("DROP TABLE store_orders CASCADE CONSTRAINTS"))
            print("✅ Usunięto tabelę store_orders")
        except Exception as e:
            print(f"ℹ️ Info: {e}")
            
        conn.commit()
    print("✨ Gotowe! Teraz możesz puścić migrację.")

if __name__ == "__main__":
    clean_tables()