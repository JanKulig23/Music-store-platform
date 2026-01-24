# 🎸 Music Store SaaS Platform

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Oracle](https://img.shields.io/badge/Oracle_DB-21c_XE-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Kompletna platforma **E-commerce w modelu SaaS (Software as a Service)** dedykowana dla sieci sklepów muzycznych. Projekt realizuje architekturę **Multi-tenancy** z wykorzystaniem współdzielonej bazy danych i zaawansowanej izolacji danych na poziomie silnika SQL.

---

## 🚀 Główne Funkcjonalności

* **🏢 Architektura Multi-tenant:** Obsługa wielu niezależnych sklepów (Tenantów) na jednej instancji aplikacji.
* **🔒 Bezpieczeństwo Danych (RLS):** Implementacja **Oracle Virtual Private Database (VPD)** – dane są izolowane fizycznie na poziomie bazy danych, co uniemożliwia wyciek informacji między klientami.
* **🛒 Hybrydowy Katalog Produktów:** Możliwość korzystania z Globalnej Bazy Instrumentów oraz tworzenia własnych ofert lokalnych.
* **⚡ Wysoka Wydajność:** Backend oparty na asynchronicznym frameworku **FastAPI** oraz sterowniku `python-oracledb` w trybie Thin Client.
* **📦 Pełna Konteneryzacja:** System gotowy do wdrożenia dzięki Docker & Docker Compose z limitami zasobów (CPU/RAM).
* **🔄 Procesy w Tle:** Wykorzystanie **APScheduler** do generowania raportów i obsługi zadań długotrwałych bez blokowania API.

---

## 🛠️ Stos Technologiczny

| Warstwa | Technologia | Opis |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS | Single Page Application (SPA), dynamiczny branding. |
| **Backend** | Python 3.12, FastAPI | Modularny Monolit, Pydantic, JWT Auth. |
| **Baza Danych** | Oracle Database 21c XE | PL/SQL Triggers, Sequences, Row-Level Security. |
| **ORM** | SQLAlchemy | Mapowanie obiektowo-relacyjne, zarządzanie sesjami. |
| **Infrastruktura** | Docker Compose | Orkiestracja kontenerów, izolacja sieciowa. |

---

## 🏗️ Architektura Systemu

Projekt został zrealizowany w modelu **Modularnego Monolitu** z architekturą bazy danych **Shared Database, Shared Schema**.

```mermaid
graph LR
    A["Klient (React)"] -->|"REST API"| B["API Gateway / Nginx"]
    B -->|"Tenant Context"| C{"FastAPI Backend"}
    C -->|"SQLAlchemy"| D[("Oracle Database")]
    D -->|"RLS Policy"| E["Dane Tenanta A"]
    D -->|"RLS Policy"| F["Dane Tenanta B"]

## Instalacja i Uruchomienie

### Wymagania wstępne
* Docker Desktop (z obsługą Linux Containers)
* Git

### Krok po kroku

1. **Sklonuj repozytorium:**
   ```bash
   git clone [https://github.com/JanKulig23/Music-store-platform.git](https://github.com/JanKulig23/Music-store-platform.git)
   cd Music-store-platform

2. **Skonfiguruj zmienne środowiskowe: Utwórz plik .env w katalogu /backend (przykładowa konfiguracja):**
```DB_USER=system
DB_PASSWORD=SecretPassword123
DB_DSN=oracle_db:1521/xepdb1
SECRET_KEY=twoj_tajny_klucz_jwt
ALGORITHM=HS256

2. **Uruchom środowisko Docker:**
```docker-compose up --build

## 🖥️ Dostęp do Aplikacji

Po poprawnym uruchomieniu kontenery są dostępne pod adresami:

* **Frontend (Sklep & Admin):** [http://localhost:3000](http://localhost:3000)
* **Backend API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Baza Danych Oracle:** `localhost:1521`

### Szybki Start (Scenariusz Testowy)

1. Wejdź na [http://localhost:3000](http://localhost:3000).
2. Wybierz **"Załóż Sklep"** (Tenant Onboarding).
3. Zaloguj się do Panelu Administratora nowo utworzonego sklepu.
4. Zaimportuj produkty z **Katalogu Globalnego**.
5. Przejdź do widoku sklepu i złóż testowe zamówienie.

## 📂 Struktura Projektu

```text
/
├── backend/             # Kod źródłowy API (Python)
│   ├── app/
│   │   ├── core/        # Konfiguracja, Middleware (Multi-tenancy)
│   │   ├── modules/     # Logika biznesowa (Auth, Sales, Inventory)
│   │   └── models/      # Modele SQLAlchemy
│   ├── worker/          # Procesy tła (Raporty)
│   └── Dockerfile
│
├── frontend/            # Kod źródłowy Klienta (React)
│   ├── src/
│   │   ├── modules/     # Komponenty domenowe (Catalog, Checkout)
│   │   └── contexts/    # Stan globalny
│   └── Dockerfile
│
└── docker-compose.yml   # Definicja infrastruktury