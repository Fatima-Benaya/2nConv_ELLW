import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { Food } from '../../services/food';
import { FoodItem } from '../../models/food';

import { FoodOrder } from './food-order';

describe('FoodOrder', () => {
  let component: FoodOrder;
  let fixture: ComponentFixture<FoodOrder>;
  let foodServiceStub: { getFoods: () => Observable<FoodItem[]> };

  beforeEach(async () => {
    foodServiceStub = {
      getFoods: () => of([] as FoodItem[]),
    };

    await TestBed.configureTestingModule({
      imports: [FoodOrder],
      providers: [
        provideHttpClientTesting(),
        { provide: Food, useValue: foodServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load foods into the menu', () => {
    const foods = [
      {
        _id: '1',
        name: 'Paella',
        description: 'Clásica',
        price: 12,
        category: 'Arroz',
        imageUrl: '',
      },
    ];
    foodServiceStub.getFoods = () => of(foods);

    component.loadFoods();

    expect(component.foods()).toEqual(foods);
    expect(component.isLoading()).toBe(false);
  });
});
