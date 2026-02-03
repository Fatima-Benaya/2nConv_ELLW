import mongoose from 'mongoose';

// Límite de longitud para evitar textos demasiado largos.
const MAX_DESCRIPTION_LENGTH = 280;

// Esquema de platos del menú.
const foodSchema = new mongoose.Schema(
  {
    
    numericId: {
      type: Number,
      index: true,
      unique: true,
    },
    // Nombre del plato.
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    // Descripción del plato.
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: MAX_DESCRIPTION_LENGTH,
    },
    // Precio en euros.
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Categoría o tipo de plato.
    category: {
      type: String,
      default: 'Plato principal',
      trim: true,
    },
    // URL de imagen del plato.
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  // createdAt y updatedAt automáticos.
  { timestamps: true }
);

// Modelo para acceder a la colección foods.
export const Food = mongoose.model('Food', foodSchema);
