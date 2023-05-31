import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAppMetasComponent } from './view-app-metas.component';

describe('ViewAppMetasComponent', () => {
  let component: ViewAppMetasComponent;
  let fixture: ComponentFixture<ViewAppMetasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAppMetasComponent]
    });
    fixture = TestBed.createComponent(ViewAppMetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
