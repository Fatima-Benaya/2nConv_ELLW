# Backend - Menjar a Domicili

API REST con Node.js, Express y MongoDB para el flujo de pedidos.

## Requisitos
- Node.js 20+
- MongoDB en ejecución local o una URI remota

## Configuración
1. Copia el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

2. Ajusta los valores de `PORT` y `MONGODB_URI` según tu entorno.

## Ejecutar en desarrollo

```bash
npm run dev
```

## Ejecutar en producción

```bash
npm start
```

## Endpoints principales
- `GET /api/health` estado del servicio
- `GET /api/foods` lista de platos
- `POST /api/foods` crear plato
- `GET /api/orders` lista de pedidos
- `POST /api/orders` crear pedido
