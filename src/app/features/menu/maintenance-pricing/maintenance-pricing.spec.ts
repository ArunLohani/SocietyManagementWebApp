import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenancePricing } from './maintenance-pricing';

describe('MaintenancePricing', () => {
  let component: MaintenancePricing;
  let fixture: ComponentFixture<MaintenancePricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenancePricing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenancePricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
