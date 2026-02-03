import { Router } from 'express';
import { Food } from '../models/Food.js';
import { Counter } from '../models/Counter.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde.' },
});

const validateFoodPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload inválido.';
  }
  const { name, price } = payload;
  if (!name || typeof name !== 'string') {
    return 'El nombre es obligatorio.';
  }
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    return 'El precio debe ser un número válido.';
  }
  return '';
};

router.use(rateLimiter);

// Obtener todos los platos.
router.get('/', async (_req, res, next) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 }).lean();
    res.json(foods);
  } catch (error) {
    next(error);
  }
});

// Obtener un plato por _id.
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id).lean();
    if (!food) {
      res.status(404).json({ message: 'Plato no encontrado.' });
      return;
    }
    res.json(food);
  } catch (error) {
    next(error);
  }
});

// Actualizar un plato por _id.
router.put('/:id', async (req, res, next) => {
  try {
    const errorMessage = validateFoodPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }
    const { id } = req.params;
    const updated = await Food.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      res.status(404).json({ message: 'Plato no encontrado.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const errorMessage = validateFoodPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }
    const counter = await Counter.findOneAndUpdate(
      { name: 'food' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).lean();
    const food = await Food.create({
      ...req.body,
      numericId: counter.seq,
    });
    res.status(201).json(food);
  } catch (error) {
    next(error);
  }
});

//borrar un plato por id en la api-rest
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Food.findByIdAndDelete(id).lean();
    if (!deleted) {
      res.status(404).json({ message: 'Plato no encontrado.' });
      return;
    }
    res.json({ message: 'Plato eliminado.' });
  } catch (error) {
    next(error);
  }
});

export default router;
