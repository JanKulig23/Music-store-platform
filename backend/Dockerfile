# 1. Obraz bazowy - Używamy wersji 'bookworm' (Debian 12), która jest stabilna i ma libaio1
FROM python:3.12-slim-bookworm

# 2. Zmienne środowiskowe dla optymalizacji Pythona
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    WORKDIR=/app

# 3. Instalacja zależności systemowych (wymagane dla Oracle Clienta!)
# W wersji bookworm pakiet libaio1 jest dostępny bez problemu
RUN apt-get update && apt-get install -y --no-install-recommends \
    libaio1 \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 4. Katalog roboczy
WORKDIR /app

# 5. Kopiowanie i instalacja zależności Pythonowych
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 6. Kopiowanie kodu aplikacji
COPY . .

# 7. Domyślna komenda
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]