import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePayslipsComponent } from './employee-payslips.component';

describe('EmployeePayslipsComponent', () => {
  let component: EmployeePayslipsComponent;
  let fixture: ComponentFixture<EmployeePayslipsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeePayslipsComponent]
    });
    fixture = TestBed.createComponent(EmployeePayslipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
