import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserAccessComponent } from './create-user-access.component';

describe('CreateUserAccessComponent', () => {
  let component: CreateUserAccessComponent;
  let fixture: ComponentFixture<CreateUserAccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUserAccessComponent]
    });
    fixture = TestBed.createComponent(CreateUserAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
