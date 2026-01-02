import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPayments } from './my-payments';

describe('MyPayments', () => {
  let component: MyPayments;
  let fixture: ComponentFixture<MyPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
