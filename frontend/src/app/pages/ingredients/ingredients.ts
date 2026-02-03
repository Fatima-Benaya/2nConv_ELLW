import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IngredientsService, Ingredient } from '../../services/ingredients';

@Component({
  selector: 'app-ingredients-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.css',
})
export class IngredientsPage {
  private readonly ingredientsService = inject(IngredientsService);

  readonly ingredients = signal<Ingredient[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly isExpanded = signal(false);

  readonly filteredIngredients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.ingredients();
    }
    return this.ingredients().filter((ingredient) =>
      ingredient.strIngredient.toLowerCase().includes(term)
    );
  });

  readonly visibleIngredients = computed(() => {
    const items = this.filteredIngredients();
    return this.isExpanded() ? items : items.slice(0, 16);
  });

  constructor() {
    this.loadIngredients();
  }

  loadIngredients(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.ingredientsService.getIngredients().subscribe({
      next: (ingredients) => {
        this.ingredients.set(ingredients);
        this.isLoading.set(false);
      },
      error: () => {
        this.ingredients.set([]);
        this.errorMessage.set('No se pudo cargar la API externa.');
        this.isLoading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.isExpanded.set(false);
  }

  toggleExpanded(): void {
    this.isExpanded.set(!this.isExpanded());
  }

  getImageUrl(name: string): string {
    const encoded = encodeURIComponent(name);
    return `https://www.themealdb.com/images/ingredients/${encoded}.png`;
  }
}
