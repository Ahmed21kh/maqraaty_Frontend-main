import { TestBed } from '@angular/core/testing';

import { AappServiceService } from './aapp-service.service';

describe('AappServiceService', () => {
  let service: AappServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AappServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
