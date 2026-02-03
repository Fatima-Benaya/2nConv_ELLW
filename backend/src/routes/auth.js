import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs'; //Librería para hashear y verificar contraseñas.
import jwt from 'jsonwebtoken'; //Librería para crear y verificar tokens JWT.
import { User } from '../models/User.js';

const router = Router();

const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde.' },
});

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const validateRegisterPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload inválido.';
  }
  const { name, email, password } = payload;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'El nombre es obligatorio.';
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'El correo es obligatorio.';
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return '';
};

const validateLoginPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload inválido.';
  }
  const { email, password } = payload;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'El correo es obligatorio.';
  }
  if (!password || typeof password !== 'string') {
    return 'La contraseña es obligatoria.';
  }
  return '';
};

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET no definido, usando valor de desarrollo.');
  }
  return jwt.sign({ sub: user._id.toString(), email: user.email }, secret, {
    expiresIn: '7d',
  });
};

router.use(rateLimiter);

router.post('/register', async (req, res, next) => {
  try {
    const errorMessage = validateRegisterPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    const email = normalizeEmail(req.body.email);
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      res.status(409).json({ message: 'El correo ya está registrado.' });
      return;
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10); 
    const user = await User.create({
      name: req.body.name.trim(),
      email,
      passwordHash,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const errorMessage = validateLoginPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const isValid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

export default router;
