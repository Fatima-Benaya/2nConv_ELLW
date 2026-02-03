import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Puntuacio } from '../models/Puntuacio.js';

const router = Router();

const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Massa sol·licituds, torna-ho a intentar més tard.' },
});

router.use(rateLimiter);

function validatePayload(body) {
  const { nom_usuari, puntuacio, nivell } = body;
  if (!nom_usuari || typeof nom_usuari !== 'string' || nom_usuari.trim().length < 2) {
    return "El nom d'usuari és obligatori i ha de tenir almenys 2 caràcters.";
  }
  if (typeof puntuacio !== 'number' || puntuacio < 0) {
    return 'La puntuació ha de ser un número positiu.';
  }
  if (typeof nivell !== 'number' || nivell < 2) {
    return 'El nivell ha de ser un número mínim de 2.';
  }
  return null;
}

// POST - Create new score
router.post('/', async (req, res, next) => {
  try {
    const errorMessage = validatePayload(req.body);
    if (errorMessage) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    const { nom_usuari, puntuacio, nivell, data_joc } = req.body;
    const newPuntuacio = new Puntuacio({
      nom_usuari: nom_usuari.trim(),
      puntuacio,
      nivell,
      data_joc: data_joc ? new Date(data_joc) : new Date(),
    });

    const saved = await newPuntuacio.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// GET - Top 5 scores by level
router.get('/top/:nivell', async (req, res, next) => {
  try {
    const nivell = parseInt(req.params.nivell, 10);
    if (isNaN(nivell) || nivell < 2) {
      res.status(400).json({ message: 'Nivell invàlid.' });
      return;
    }

    const topScores = await Puntuacio.find({ nivell })
      .sort({ puntuacio: -1 })
      .limit(5)
      .exec();

    res.json(topScores);
  } catch (error) {
    next(error);
  }
});

// PUT - Update score by ID
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { puntuacio } = req.body;

    if (typeof puntuacio !== 'number' || puntuacio < 0) {
      res.status(400).json({ message: 'La puntuació ha de ser un número positiu.' });
      return;
    }

    const existing = await Puntuacio.findById(id);
    if (!existing) {
      res.status(404).json({ message: 'Puntuació no trobada.' });
      return;
    }

    existing.puntuacio = puntuacio;
    existing.data_joc = new Date();
    const updated = await existing.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;