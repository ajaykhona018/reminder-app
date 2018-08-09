import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayaccountsComponent } from './displayaccounts.component';

describe('DisplayaccountsComponent', () => {
  let component: DisplayaccountsComponent;
  let fixture: ComponentFixture<DisplayaccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayaccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayaccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
