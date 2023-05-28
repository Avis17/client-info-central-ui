import { TestBed } from '@angular/core/testing';

import { AppMetaCreationService } from './app-meta-creation.service';

describe('AppMetaCreationService', () => {
  let service: AppMetaCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppMetaCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
