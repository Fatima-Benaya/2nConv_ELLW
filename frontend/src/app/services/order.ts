import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderPayload } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class Order {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  submitOrder(order: OrderPayload): Observable<OrderPayload> {
    return this.http.post<OrderPayload>(`${this.apiBase}/orders`, order);
  }
}
