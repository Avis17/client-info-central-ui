import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditPointManagementComponent } from './credit-point-management.component';

describe('CreditPointManagementComponent', () => {
  let component: CreditPointManagementComponent;
  let fixture: ComponentFixture<CreditPointManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreditPointManagementComponent]
    });
    fixture = TestBed.createComponent(CreditPointManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
