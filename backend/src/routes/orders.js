import { Router } from 'express';
import { Order } from '../models/Order.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde.' },
});

const validateOrderPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload inválido.';
  }
  const { customerName, address, phone, email, paymentMethod, paymentDetails, items, total } = payload;
  if (!customerName || typeof customerName !== 'string') {
    return 'El nombre es obligatorio.';
  }
  if (!address || typeof address !== 'string') {
    return 'La dirección es obligatoria.';
  }
  if (!phone || typeof phone !== 'string') {
    return 'El teléfono es obligatorio.';
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'El correo es obligatorio.';
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return 'El método de pago es obligatorio.';
  }
  if (!['Tarjeta', 'Bizum', 'Efectivo'].includes(paymentMethod)) {
    return 'El método de pago no es válido.';
  }
  if (paymentMethod === 'Tarjeta') {
    if (!paymentDetails || typeof paymentDetails !== 'object') {
      return 'Los datos de tarjeta son obligatorios.';
    }
    const { cardHolder, cardLast4, cardExpiry } = paymentDetails;
    if (!cardHolder || typeof cardHolder !== 'string') {
      return 'El titular de la tarjeta es obligatorio.';
    }
    if (!cardLast4 || typeof cardLast4 !== 'string' || cardLast4.length !== 4) {
      return 'Los últimos 4 dígitos son obligatorios.';
    }
    if (!cardExpiry || typeof cardExpiry !== 'string') {
      return 'La caducidad es obligatoria.';
    }
  }
  if (paymentMethod === 'Bizum') {
    if (!paymentDetails || typeof paymentDetails !== 'object') {
      return 'Los datos de Bizum son obligatorios.';
    }
    const { bizumPhone } = paymentDetails;
    if (!bizumPhone || typeof bizumPhone !== 'string') {
      return 'El teléfono de Bizum es obligatorio.';
    }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return 'El pedido requiere al menos un item.';
  }
  const invalidItem = items.find(
    (item) =>
      !item ||
      typeof item.foodId !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      Number.isNaN(item.price) ||
      item.price < 0 ||
      typeof item.quantity !== 'number' ||
      Number.isNaN(item.quantity) ||
      item.quantity < 1
  );
  if (invalidItem) {
    return 'Los items del pedido son inválidos.';
  }
  if (typeof total !== 'number' || Number.isNaN(total) || total < 0) {
    return 'El total debe ser un número válido.';
  }
  return '';
};

router.use(rateLimiter);


router.get('/', async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const errorMessage = validateOrderPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
