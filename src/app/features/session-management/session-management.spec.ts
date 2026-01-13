import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionManagement } from './session-management';

describe('SessionManagement', () => {
  let component: SessionManagement;
  let fixture: ComponentFixture<SessionManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
