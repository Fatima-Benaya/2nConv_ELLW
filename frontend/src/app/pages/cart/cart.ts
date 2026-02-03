import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartPanel } from '../../components/cart-panel/cart-panel';
import { CartStore } from '../../services/cart-store';
import { Order } from '../../services/order';
import { OrderPayload } from '../../models/order';

@Component({
  selector: 'app-cart-page',
  imports: [CartPanel, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartPage {
  private readonly cartStore = inject(CartStore);
  private readonly orderService = inject(Order);

  readonly customerName = signal('');
  readonly address = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly paymentMethod = signal('');
  readonly cardHolder = signal('');
  readonly cardNumber = signal('');
  readonly cardExpiry = signal('');
  readonly bizumPhone = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isLoading = signal(false);

  readonly cart = this.cartStore.cart;
  readonly cartCount = this.cartStore.cartCount;
  readonly cartTotal = this.cartStore.cartTotal;

  readonly isFormInvalid = computed(() => {
    if (!this.customerName() || !this.address() || !this.phone() || !this.email()) {
      return true;
    }
    if (!this.paymentMethod()) {
      return true;
    }
    if (this.paymentMethod() === 'Tarjeta') {
      return !this.cardHolder() || !this.cardNumber() || !this.cardExpiry();
    }
    if (this.paymentMethod() === 'Bizum') {
      return !this.bizumPhone();
    }
    return false;
  });

  updateQuantity(foodId: string, quantity: number): void {
    this.cartStore.updateQuantity(foodId, quantity);
  }

  removeItem(foodId: string): void {
    this.cartStore.removeItem(foodId);
  }

  submitOrder(): void {
    if (!this.cart().length) {
      this.errorMessage.set('Agrega platos antes de confirmar.');
      this.successMessage.set('');
      return;
    }
    if (this.isFormInvalid()) {
      this.errorMessage.set('Completa los datos de entrega.');
      this.successMessage.set('');
      return;
    }
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const payload: OrderPayload = {
      customerName: this.customerName(),
      address: this.address(),
      phone: this.phone(),
      email: this.email(),
      paymentMethod: this.paymentMethod(),
      paymentDetails:
        this.paymentMethod() === 'Tarjeta'
          ? {
              cardHolder: this.cardHolder(),
              cardLast4: this.cardNumber().slice(-4),
              cardExpiry: this.cardExpiry(),
            }
          : this.paymentMethod() === 'Bizum'
            ? {
                bizumPhone: this.bizumPhone(),
              }
            : undefined,
      items: this.cart(),
      total: this.cartTotal(),
    };

    this.orderService.submitOrder(payload).subscribe({
      next: () => {
        const email = this.email();
        this.cartStore.clearCart();
        this.customerName.set('');
        this.address.set('');
        this.phone.set('');
        this.email.set('');
        this.paymentMethod.set('');
        this.cardHolder.set('');
        this.cardNumber.set('');
        this.cardExpiry.set('');
        this.bizumPhone.set('');
        this.successMessage.set(
          `Pedido enviado. Revisa tu correo (${email}) para el seguimiento.`
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo enviar el pedido. Intenta de nuevo.');
        this.successMessage.set('');
        this.isLoading.set(false);
      },
    });
  }
}
