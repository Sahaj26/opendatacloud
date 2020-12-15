import { TestBed } from '@angular/core/testing';

import { ResolveIpService } from './resolve-ip.service';

describe('ResolveIpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResolveIpService = TestBed.get(ResolveIpService);
    expect(service).toBeTruthy();
  });
});
