import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Food } from './food';

describe('Food', () => {
  let service: Food;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(Food);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
