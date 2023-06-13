import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebillComponent } from './rebill.component';

describe('RebillComponent', () => {
  let component: RebillComponent;
  let fixture: ComponentFixture<RebillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RebillComponent]
    });
    fixture = TestBed.createComponent(RebillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
