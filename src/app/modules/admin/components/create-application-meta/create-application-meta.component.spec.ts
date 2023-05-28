import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateApplicationMetaComponent } from './create-application-meta.component';

describe('CreateApplicationMetaComponent', () => {
  let component: CreateApplicationMetaComponent;
  let fixture: ComponentFixture<CreateApplicationMetaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateApplicationMetaComponent]
    });
    fixture = TestBed.createComponent(CreateApplicationMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
