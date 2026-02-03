# Menjar a Domicili

Proyecto de pedidos de comida a domicilio con frontend en Angular y backend en Node.js/Express.

## Requisitos
- Node.js 20+
- MongoDB local o remoto

## Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

La app se sirve en `http://localhost:4200/`.

## Backend (Express + MongoDB)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

La API REST queda disponible en `http://localhost:4000/api`.

### Endpoints disponibles
- `GET /api/health`
- `GET /api/foods`
- `POST /api/foods`
- `GET /api/orders`
- `POST /api/orders`

## Flujo recomendado
1. Arranca MongoDB.
2. Ejecuta el backend.
3. Ejecuta el frontend y carga el menú desde la API.
