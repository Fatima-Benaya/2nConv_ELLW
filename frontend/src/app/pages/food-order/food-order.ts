import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Food } from '../../services/food';
import { FoodItem } from '../../models/food';
import { CartStore } from '../../services/cart-store';
import { AuthService, AuthUser } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-food-order',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './food-order.html',
  styleUrl: './food-order.css',
})
export class FoodOrder implements AfterViewInit, OnDestroy {
  private readonly demoFoods: FoodItem[] = [
    {
      _id: 'demo-1',
      name: 'Quinoa con pollo',
      description: 'Quinoa, pollo marinado, aguacate y verduras asadas.',
      price: 11.5,
      category: 'Saludable',
      imageUrl: '/images/quinoa.jpeg',
    },
    {
      _id: 'demo-2',
      name: 'Pasta carbonara',
      description: 'Pasta fresca, salsa cremosa, panceta y queso parmesano.',
      price: 10.2,
      category: 'Italiano',
      imageUrl: '/images/Espaguetis-Carbonara.jpg',
    },
    {
      _id: 'demo-3',
      name: 'Salmón al horno con salsa',
      description: 'Con patatas baby y salsa cítrica',
      price: 13.9,
      category: 'Gourmet',
      imageUrl: '/images/receta-de-salmon-al-horno.webp',
    },
    {
      _id: 'demo-4',
      name: 'Ensalada de temporada',
      description: 'Hojas frescas, frutos secos y vinagreta de miel.',
      price: 8.6,
      category: 'Ensaladas',
      imageUrl: '/images/ensalada.avif',
    },
    {
      _id: 'demo-5',
      name: 'Paella de mariscos',
      description: 'Receta tradicional lista en 30 minutos.',
      price: 12.8,
      category: 'Tradicional',
      imageUrl: '/images/paella.avif',
    },
    {
      _id: 'demo-7',
      name: 'Tartar de atún y aguacate',
      description: 'Atún fresco con aguacate y sésamo tostado.',
      price: 12.4,
      category: 'Mar',
      imageUrl: '/images/tartar-de-atun.jpg',
    },
    {
      _id: 'demo-8',
      name: 'Cheesecake de frutos rojos',
      description: 'Con coulis de frutos rojos y base de galleta.',
      price: 6.5,
      category: 'Postres',
      imageUrl: '/images/cheeseCake.jpg',
    },
    {
      _id: 'demo-9',
      name: 'Pizza margarita',
      description: 'Tomate, mozzarella fresca y albahaca.',
      price: 9.8,
      category: 'Italiano',
      imageUrl: '/images/pizza-margarita.jpg',
    },
    {
      _id: 'demo-10',
      name: 'Tarta de chocolate',
      description: 'Bizcocho húmedo con ganache de cacao.',
      price: 6.9,
      category: 'Postres',
      imageUrl: '/images/tarta-chocolate.jpg',
    },

    {
      _id: 'demo-11',
      name: 'Lasaña',
      description: 'Capas de pasta, carne, bechamel y queso gratinado.',
      price: 9.6,
      category: 'Italiano',
      imageUrl: '/images/lasana.jpg',
    },
    {
      _id: 'demo-12',
      name: 'Ramen miso',
      description: 'Caldo miso, setas, huevo marinado y noodles frescos.',
      price: 11.2,
      category: 'Japones',
      imageUrl: '/images/ramen-miso.jpg',
    },

    {
      _id: 'demo-13',
      name: 'Crema catalana',
      description: 'Postre tradicional con crema y azúcar caramelizado.',
      price: 5.9,
      category: 'Postres',
      imageUrl: '/images/receta-de-crema-catalana.jpg',
    },
  ];
  private autoScrollId?: number;
  private readonly foodService = inject(Food);
  private readonly cartStore = inject(CartStore);
  private readonly auth = inject(AuthService);
  @ViewChild('featuredTrack') private readonly featuredTrack?: ElementRef<HTMLDivElement>;
  readonly foods = signal<FoodItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly useApiFoods = signal(this.getInitialFoodSource());

  readonly user = signal<AuthUser | null>(this.auth.getUser());
  readonly isAuthenticated = computed(() => !!this.user());
  readonly userName = computed(() => this.user()?.name ?? '');

  readonly cart = this.cartStore.cart;
  readonly cartCount = this.cartStore.cartCount;
  readonly cartTotal = this.cartStore.cartTotal;

  readonly filteredFoods = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.foods();
    }
    return this.foods().filter((food) => {
      const haystack = `${food.name} ${food.category ?? ''} ${food.description ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  constructor() {
    this.loadFoods();
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  loadFoods(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    if (!this.useApiFoods()) {
      this.foods.set(this.demoFoods);
      this.isLoading.set(false);
      return;
    }
    this.foodService.getFoods().subscribe({
      next: (foods) => {
        this.foods.set(foods);
        if (!foods.length) {
          this.errorMessage.set('No hay platos en la API todavía.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.foods.set([]);
        this.errorMessage.set('No se pudo cargar el menú desde la API.');
        this.isLoading.set(false);
      },
    });
  }

  setFoodSource(source: 'api' | 'demo'): void {
    const useApi = source === 'api';
    this.useApiFoods.set(useApi);
    localStorage.setItem('foodSource', source);
    this.loadFoods();
  }

  addToCart(food: FoodItem): void {
    this.cartStore.addToCart(food);
  }

  updateQuantity(foodId: string, quantity: number): void {
    this.cartStore.updateQuantity(foodId, quantity);
  }

  removeItem(foodId: string): void {
    this.cartStore.removeItem(foodId);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  scrollFeatured(direction: 'left' | 'right'): void {
    const track = this.featuredTrack?.nativeElement;
    if (!track) {
      return;
    }
    const scrollAmount = track.clientWidth * 0.7;
    const offset = direction === 'left' ? -scrollAmount : scrollAmount;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  }

  pauseFeatured(): void {
    this.stopAutoScroll();
  }

  resumeFeatured(): void {
    this.startAutoScroll();
  }

  scrollToMenu(): void {
    const section = document.getElementById('menu');
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    this.autoScrollId = window.setInterval(() => {
      const track = this.featuredTrack?.nativeElement;
      if (!track) {
        return;
      }
      const maxScroll = track.scrollWidth - track.clientWidth - 4;
      if (track.scrollLeft >= maxScroll) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      this.scrollFeatured('right');
    }, 4500);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollId !== undefined) {
      window.clearInterval(this.autoScrollId);
      this.autoScrollId = undefined;
    }
  }

  private getInitialFoodSource(): boolean {
    const stored = localStorage.getItem('foodSource');
    if (stored === 'demo') {
      return false;
    }
    if (stored === 'api') {
      return true;
    }
    return environment.useApiFoods;
  }
}
