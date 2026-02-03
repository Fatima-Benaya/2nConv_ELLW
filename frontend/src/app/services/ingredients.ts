import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Ingredient {
  idIngredient: string;
  strIngredient: string;
  strType?: string | null;
}

interface IngredientResponse {
  meals: Ingredient[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class IngredientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';

  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<IngredientResponse>(this.apiUrl).pipe(
      map((response) => response.meals ?? [])
    );
  }
}
