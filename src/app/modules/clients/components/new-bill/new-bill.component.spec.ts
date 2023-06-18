import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBillComponent } from './new-bill.component';

describe('NewBillComponent', () => {
  let component: NewBillComponent;
  let fixture: ComponentFixture<NewBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewBillComponent]
    });
    fixture = TestBed.createComponent(NewBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
