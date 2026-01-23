import time
import sys

# Prosty symulator Workera
# W prawdziwym życiu tutaj byłby np. Celery Worker nasłuchujący zadań
def run_worker():
    print("--- URUCHAMIANIE WORKERA TŁA ---", file=sys.stdout)
    print("Moduł: Przetwarzanie asynchroniczne", file=sys.stdout)
    
    while True:
        # Symulacja sprawdzania kolejki zadań co 10 sekund
        print("[Worker] Sprawdzam kolejkę zadań... (Brak nowych zadań)", file=sys.stdout)
        time.sleep(10)

if __name__ == "__main__":
    run_worker()