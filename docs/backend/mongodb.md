# Backend con MongoDB

## Requisitos

- Node.js y npm.
- Docker y Docker Compose.

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

Las dependencias `dotenv` y `mongodb` permiten cargar la configuración y conectar
Express con MongoDB.

## Configuración

El archivo `.env` contiene la configuración local:

```env
VITE_API_URL=http://localhost:3000
PORT=3000
MONGO_URI=mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin
```

`docker-compose.yml` crea un contenedor MongoDB 8.0, publica el puerto `27017` y
mantiene los datos en el volumen `mongodb_data`.

## Arranque

Iniciar MongoDB:

```bash
docker compose up -d
```

Iniciar el backend:

```bash
npm start
```

El servidor Express queda disponible en `http://localhost:3000`.

En otra terminal, iniciar Vue:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## API actual

`GET /api/municipios` devuelve los datos de `backend/data/municipios.json`.

El backend ya verifica la conexión con MongoDB antes de iniciar Express. MongoDB
está preparado para incorporar posteriormente modelos y operaciones CRUD.

## Detener MongoDB

```bash
docker compose down
```

Los datos se conservan en el volumen de Docker mientras no se utilice `down -v`.
