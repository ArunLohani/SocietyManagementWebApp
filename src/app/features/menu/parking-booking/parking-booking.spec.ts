import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingBooking } from './parking-booking';

describe('ParkingBooking', () => {
  let component: ParkingBooking;
  let fixture: ComponentFixture<ParkingBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
