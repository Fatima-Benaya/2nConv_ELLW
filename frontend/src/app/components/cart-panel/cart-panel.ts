import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderItem } from '../../models/order';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './cart-panel.html',
  styleUrl: './cart-panel.css',
})
export class CartPanel {
  @Input() cart: OrderItem[] = [];
  @Input() cartCount = 0;
  @Input() cartTotal = 0;
  @Input() isLoading = false;

  @Output() quantityChange = new EventEmitter<{ foodId: string; quantity: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() submitOrder = new EventEmitter<void>();
}
