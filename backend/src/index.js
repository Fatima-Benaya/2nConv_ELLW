import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import foodsRouter from './routes/foods.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import puntuacionsRouter from './routes/puntuacions.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/foods', foodsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/puntuacions', puntuacionsRouter);

app.use((error, _req, res, _next) => {
  console.error(error?.message ?? 'Error inesperado');
  res.status(500).json({ message: 'Error inesperado en el servidor.' });
});

const port = Number(process.env.PORT) || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/menjar-a-domicili';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB', error);
    process.exit(1);
  });
