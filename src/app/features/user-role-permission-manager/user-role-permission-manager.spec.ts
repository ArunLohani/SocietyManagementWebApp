import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRolePermissionManager } from './user-role-permission-manager';

describe('UserRolePermissionManager', () => {
  let component: UserRolePermissionManager;
  let fixture: ComponentFixture<UserRolePermissionManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRolePermissionManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRolePermissionManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
