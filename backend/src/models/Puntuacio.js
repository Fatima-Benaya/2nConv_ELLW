import mongoose from 'mongoose';

const PuntuacioSchema = new mongoose.Schema(
  {
    nom_usuari: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    puntuacio: {
      type: Number,
      required: true,
      min : 0,
    },

    nivell: {
      type: Number,
      required: true,
      min : 0,
    },
    
  },
  { timestamps: true }
);

export const Puntuacio = mongoose.model('Puntuacio', PuntuacioSchema);
