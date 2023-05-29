import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormCreationComponent } from './dynamic-form-creation.component';

describe('DynamicFormCreationComponent', () => {
  let component: DynamicFormCreationComponent;
  let fixture: ComponentFixture<DynamicFormCreationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicFormCreationComponent]
    });
    fixture = TestBed.createComponent(DynamicFormCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
