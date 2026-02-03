import { Router } from 'express';
import { Puntuacio } from '../models/Puntuacio.js';



const router = Router();



router.post('/puntuacions', async (req, res, next) => {
  try {
    const errorMessage = validateRegisterPayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }

  } catch (error) {
    next(error);
  }
});