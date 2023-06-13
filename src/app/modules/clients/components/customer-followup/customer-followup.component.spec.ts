import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFollowupComponent } from './customer-followup.component';

describe('CustomerFollowupComponent', () => {
  let component: CustomerFollowupComponent;
  let fixture: ComponentFixture<CustomerFollowupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerFollowupComponent]
    });
    fixture = TestBed.createComponent(CustomerFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
