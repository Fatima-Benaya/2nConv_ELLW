import mongoose from 'mongoose';

// Contador genérico para autoincrementar IDs numéricos.
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);
