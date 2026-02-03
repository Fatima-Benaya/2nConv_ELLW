import { Injectable, computed, signal } from '@angular/core';
import { OrderItem } from '../models/order';
import { FoodItem } from '../models/food';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private static readonly MIN_QUANTITY = 1;
  readonly cart = signal<OrderItem[]>([]);

  readonly cartTotal = computed(() =>
    this.cart().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  readonly cartCount = computed(() =>
    this.cart().reduce((total, item) => total + item.quantity, 0)
  );

  addToCart(food: FoodItem): void {
    const cart = this.cart();
    const existing = cart.find((item) => item.foodId === food._id);
    if (existing) {
      existing.quantity += 1;
      this.cart.set([...cart]);
      return;
    }
    this.cart.set([
      ...cart,
      {
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity: 1,
      },
    ]);
  }

  updateQuantity(foodId: string, quantity: number): void {
    const sanitizedQuantity = Math.max(CartStore.MIN_QUANTITY, Math.floor(quantity));
    const updated = this.cart().map((item) =>
      item.foodId === foodId ? { ...item, quantity: sanitizedQuantity } : item
    );
    this.cart.set(updated);
  }

  removeItem(foodId: string): void {
    this.cart.set(this.cart().filter((item) => item.foodId !== foodId));
  }

  clearCart(): void {
    this.cart.set([]);
  }
}
