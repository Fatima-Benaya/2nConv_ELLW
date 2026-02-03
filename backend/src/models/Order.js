import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Tarjeta', 'Bizum', 'Efectivo'],
    },
    paymentDetails: {
      cardHolder: { type: String, trim: true, default: '' },
      cardLast4: { type: String, trim: true, default: '' },
      cardExpiry: { type: String, trim: true, default: '' },
      bizumPhone: { type: String, trim: true, default: '' },
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Pendiente', 'Preparando', 'En camino', 'Entregado'],
      default: 'Pendiente',
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
