import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillBalanceTrackerComponent } from './bill-balance-tracker.component';

describe('BillBalanceTrackerComponent', () => {
  let component: BillBalanceTrackerComponent;
  let fixture: ComponentFixture<BillBalanceTrackerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillBalanceTrackerComponent]
    });
    fixture = TestBed.createComponent(BillBalanceTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
