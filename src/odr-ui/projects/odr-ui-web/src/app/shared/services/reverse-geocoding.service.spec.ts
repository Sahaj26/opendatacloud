import { TestBed } from '@angular/core/testing';

import { ReverseGeocodingService } from './reverse-geocoding.service';

describe('ReverseGeocodingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReverseGeocodingService = TestBed.get(ReverseGeocodingService);
    expect(service).toBeTruthy();
  });
});
