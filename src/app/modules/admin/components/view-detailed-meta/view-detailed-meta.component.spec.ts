import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailedMetaComponent } from './view-detailed-meta.component';

describe('ViewDetailedMetaComponent', () => {
  let component: ViewDetailedMetaComponent;
  let fixture: ComponentFixture<ViewDetailedMetaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDetailedMetaComponent]
    });
    fixture = TestBed.createComponent(ViewDetailedMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
