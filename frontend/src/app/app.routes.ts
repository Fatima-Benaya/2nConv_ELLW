import { Routes } from '@angular/router';
import { FoodOrder } from './pages/food-order/food-order';
import { CartPage } from './pages/cart/cart';
import { LoginPage } from './pages/login/login';
import { SignupPage } from './pages/signup/signup';
import { ProfilePage } from './pages/profile/profile';
import { authGuard } from './guards/auth.guard';
import { IngredientsPage } from './pages/ingredients/ingredients';

export const routes: Routes = [
  { path: '', component: FoodOrder },
  { path: 'ingredientes', component: IngredientsPage },
  { path: 'carrito', component: CartPage },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: SignupPage },
  { path: 'perfil', component: ProfilePage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
