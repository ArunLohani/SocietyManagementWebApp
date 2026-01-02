import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeDetail } from './notice-detail';

describe('NoticeDetail', () => {
  let component: NoticeDetail;
  let fixture: ComponentFixture<NoticeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
