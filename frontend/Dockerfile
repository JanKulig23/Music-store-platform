# --- ETAP 1: Budowanie (Build Stage) ---
# Używamy obrazu Node.js, żeby zbudować pliki Reacta
FROM node:22-alpine as build

WORKDIR /app

# Kopiujemy pliki zależności
COPY package.json package-lock.json ./

# Instalujemy biblioteki (clean install dla pewności)
RUN npm ci

# Kopiujemy resztę kodu źródłowego
COPY . .

# Budujemy wersję produkcyjną (utworzy folder /app/build)
RUN npm run build

# --- ETAP 2: Serwowanie (Production Stage) ---
# Używamy lekkiego serwera Nginx do serwowania plików statycznych
FROM nginx:alpine

# Kopiujemy zbudowane pliki z Etapu 1 do katalogu Nginxa
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiujemy naszą konfigurację Nginx (żeby routing Reacta działał)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Otwieramy port 80
EXPOSE 80

# Uruchamiamy Nginx
CMD ["nginx", "-g", "daemon off;"]