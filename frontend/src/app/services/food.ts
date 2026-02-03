import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FoodItem } from '../models/food';

@Injectable({
  providedIn: 'root',
})
export class Food {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  getFoods(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.apiBase}/foods`);
  }
}
