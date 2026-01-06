import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TenantService } from '../../core/service/tenant.service';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { MenuService } from '../../core/service/menu.service';
import { ActionService } from '../../core/service/action.service';
import { TenantRoleMenuService } from '../../core/service/tenant-role-menu.service';
import { TenantRoleMenuActionService } from '../../core/service/tenant-role-menu-action.service';
import { AuthService } from '../../core/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import {
  Tenant,
  TenantRoles,
  Menu,
  Action,
  MenuWithActions,
  ActionPermission,
  TenantRoleMenu,
  MenuCreateRequest
} from '../../types/types';

// PrimeNG Imports
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-user-role-permission-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PaginatorModule,
    CardModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    BadgeModule,
    DialogModule,
    FloatLabelModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './user-role-permission-manager.html',
  styleUrl: './user-role-permission-manager.css'
})
export class UserRolePermissionManager implements OnInit {
  // Data
  tenant: Tenant | null = null;
  tenantRoles: Array<TenantRoles> = [];
  allMenus: Array<Menu> = [];
  allActions: Array<Action> = [];
  menusWithActions: Array<MenuWithActions> = [];
  menuName: string = "";
  menuDescription: string = "";
  menuIsActive = true;

  // Selected state
  selectedTenantId: number | null = null;
  selectedTenant: Tenant | null = null;
  selectedTenantRoleId: number | null = null;
  selectedTenantRole: TenantRoles | null = null;

  // UI state
  loading: boolean = false;
  loadingPermissions: boolean = false;
  processingMenuId: number | null = null;
  processingActionId: number | null = null;
  showMenuAddModal: boolean = false;
  row: number = 6;
  first: number = 0;
  totalRecords: number = 0;

  // Search & Filter
  searchTerm: string = '';
  showOnlyGranted: boolean = false;

  constructor(
    private tenantService: TenantService,
    private tenantRoleService: TenantRoleService,
    private menuService: MenuService,
    private actionService: ActionService,
    private tenantRoleMenuService: TenantRoleMenuService,
    private tenantRoleMenuActionService: TenantRoleMenuActionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId()?.toString() || '';
    console.log("tenantId",this.authService.getTenantId())
    forkJoin({
      tenant: this.tenantService.getTenantById(tenantId),
      menus: this.menuService.getAllMenusPaginated(),
      actions: this.actionService.getAllActions()
    }).subscribe({
      next: (result) => {
        this.tenant = result.tenant.data;
        this.allMenus = result.menus.content.filter(m => m.isActive);
        this.allActions = result.actions.data.filter(a => a.isActive);
        this.row = result.menus.numberOfElements;
        this.totalRecords = result.menus.totalElements;

        this.selectedTenantId = this.tenant.id;
        this.selectedTenant = this.tenant;
        this.selectedTenantRoleId = null;
        this.selectedTenantRole = null;
        this.menusWithActions = [];
        this.loadRolesForTenant(this.selectedTenantId);

        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load initial data', 'Error');
        this.loading = false;
        console.error('Error loading data:', err);
      }
    });
  }

  loadMenus(event: PaginatorState): void {
    this.loading = true;
    this.menuService.getAllMenusPaginated(event.page).subscribe({
      next: (response) => {
        this.allMenus = response.content.filter(m => m.isActive);
        this.loading = false;
        this.refreshPermissions();
      },
      error: (err) => {
        this.toastr.error('Failed to load menu', 'Error');
        this.loading = false;
        console.error('Error loading data:', err);
      },
    });
  }

  onPageChange(event: PaginatorState) {
    this.loadMenus(event);
    this.row = event.rows ?? 6;
    this.first = event.first ?? 0;
  }

  loadRolesForTenant(tenantId: number): void {
    this.loadingPermissions = true;
    this.tenantRoles = [];

    this.tenantRoleService.getRolesForTenant(tenantId).subscribe({
      next: (response) => {
        this.tenantRoles = response.data.filter(tr => tr.isActive);
        this.loadingPermissions = false;

        if (this.tenantRoles.length === 0) {
          this.toastr.error('No roles assigned to this society', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load roles', 'Error');
        this.loadingPermissions = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  onRoleSelect(event: any): void {
    const tenantRoleId = event.value;

    if (!tenantRoleId) {
      this.selectedTenantRoleId = null;
      this.selectedTenantRole = null;
      this.menusWithActions = [];
      return;
    }

    this.selectedTenantRoleId = tenantRoleId;
    this.selectedTenantRole = this.tenantRoles.find(tr => tr.id === tenantRoleId) || null;
    this.loadPermissionsForRole(tenantRoleId);
  }

  loadPermissionsForRole(tenantRoleId: number): void {
    this.loadingPermissions = true;
    this.menusWithActions = [];

    this.tenantRoleMenuService.getMenusForTenantRole(tenantRoleId).subscribe({
      next: (response) => {
        const assignedMenus = response.data.filter(trm => trm.isActive);
        this.buildMenuActionsStructure(assignedMenus);
        this.loadingPermissions = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load permissions', 'Error');
        this.loadingPermissions = false;
        console.error('Error loading permissions:', err);
      }
    });
  }

  buildMenuActionsStructure(assignedMenus: TenantRoleMenu[]): void {
    this.menusWithActions = this.allMenus.map(menu => {
      const tenantRoleMenu = assignedMenus.find(trm => trm.menu.id === menu.id);

      const menuWithActions: MenuWithActions = {
        menu: menu,
        tenantRoleMenuId: tenantRoleMenu?.id || null,
        hasMenuAccess: !!tenantRoleMenu,
        actions: []
      };

      if (tenantRoleMenu) {
        this.loadActionsForMenu(tenantRoleMenu.id, menuWithActions);
      } else {
        menuWithActions.actions = this.allActions.map(action => ({
          action: action,
          granted: false,
          tenantRoleMenuActionId: null
        }));
      }

      return menuWithActions;
    });
  }

  loadActionsForMenu(tenantRoleMenuId: number, menuWithActions: MenuWithActions): void {
    this.tenantRoleMenuActionService.getActionsForTenantRoleMenu(tenantRoleMenuId).subscribe({
      next: (response) => {
        const grantedActions = response.data.filter(trma => trma.isActive);

        menuWithActions.actions = this.allActions.map(action => {
          const granted = grantedActions.find(ga => ga.action.id === action.id);
          return {
            action: action,
            granted: !!granted,
            tenantRoleMenuActionId: granted?.id || null
          };
        });
      },
      error: (err) => {
        console.error('Error loading actions for menu:', err);
        menuWithActions.actions = this.allActions.map(action => ({
          action: action,
          granted: false,
          tenantRoleMenuActionId: null
        }));
      }
    });
  }

  toggleMenuAccess(menuWithActions: MenuWithActions, event: any): void {
    const isChecked = event.checked;

    if (!this.selectedTenantRoleId) return;

    this.processingMenuId = menuWithActions.menu.id;

    if (isChecked) {
      this.grantMenuAccess(menuWithActions);
    } else {
      this.revokeMenuAccess(menuWithActions);
    }
  }

  grantMenuAccess(menuWithActions: MenuWithActions): void {
    if (!this.selectedTenantRoleId) return;

    this.tenantRoleMenuService
      .assignMenuToTenantRole(this.selectedTenantRoleId, menuWithActions.menu.id)
      .subscribe({
        next: (response) => {
          menuWithActions.hasMenuAccess = true;
          menuWithActions.tenantRoleMenuId = response.data.id;

          menuWithActions.actions = this.allActions.map(action => ({
            action: action,
            granted: false,
            tenantRoleMenuActionId: null
          }));

          this.processingMenuId = null;
          this.refreshPermissions();
          this.toastr.success(`Menu "${menuWithActions.menu.menuName}" access granted`, 'Success');
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to grant menu access', 'Error');
          this.processingMenuId = null;
          this.refreshPermissions();
        }
      });
  }

  revokeMenuAccess(menuWithActions: MenuWithActions): void {
    if (!this.selectedTenantRoleId) return;

    this.tenantRoleMenuService
      .removeMenuFromTenantRole(this.selectedTenantRoleId, menuWithActions.menu.id)
      .subscribe({
        next: () => {
          menuWithActions.hasMenuAccess = false;
          menuWithActions.tenantRoleMenuId = null;

          menuWithActions.actions = this.allActions.map(action => ({
            action: action,
            granted: false,
            tenantRoleMenuActionId: null
          }));

          this.processingMenuId = null;
          this.refreshPermissions();
          this.toastr.success(`Menu "${menuWithActions.menu.menuName}" access revoked`, 'Success');
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to revoke menu access', 'Error');
          this.processingMenuId = null;
          this.refreshPermissions();
        }
      });
  }

  toggleAction(menuWithActions: MenuWithActions, actionPermission: ActionPermission, event: any): void {
    const isChecked = event.checked;

    if (!menuWithActions.tenantRoleMenuId) {
      this.toastr.error('Please grant menu access first', 'Error');
      return;
    }

    this.processingActionId = actionPermission.action.id;

    if (isChecked) {
      this.grantActionPermission(menuWithActions, actionPermission);
    } else {
      this.revokeActionPermission(menuWithActions, actionPermission);
    }
  }

  grantActionPermission(menuWithActions: MenuWithActions, actionPermission: ActionPermission): void {
    if (!menuWithActions.tenantRoleMenuId) return;

    this.tenantRoleMenuActionService
      .assignActionToTenantRoleMenu(menuWithActions.tenantRoleMenuId, actionPermission.action.id)
      .subscribe({
        next: (response) => {
          actionPermission.granted = true;
          actionPermission.tenantRoleMenuActionId = response.data.id;
          this.processingActionId = null;
          this.toastr.success(
            `${actionPermission.action.action} permission granted for ${menuWithActions.menu.menuName}`,
            'Success'
          );
          this.refreshPermissions();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to grant permission', 'Error');
          this.processingActionId = null;
          this.refreshPermissions();
        }
      });
  }

  revokeActionPermission(menuWithActions: MenuWithActions, actionPermission: ActionPermission): void {
    if (!menuWithActions.tenantRoleMenuId) return;

    this.tenantRoleMenuActionService
      .removeActionFromTenantRoleMenu(menuWithActions.tenantRoleMenuId, actionPermission.action.id)
      .subscribe({
        next: () => {
          actionPermission.granted = false;
          actionPermission.tenantRoleMenuActionId = null;
          this.processingActionId = null;
          this.toastr.success(
            `${actionPermission.action.action} permission revoked for ${menuWithActions.menu.menuName}`,
            'Success'
          );
        },
        error: (err) => {
          this.processingActionId = null;
          this.refreshPermissions();
          this.toastr.error(err.error?.message || 'Failed to revoke permission', 'Error');
        }
      });
  }

  get filteredMenus(): Array<MenuWithActions> {
    let filtered = [...this.menusWithActions];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mwa =>
        mwa.menu.menuName.toLowerCase().includes(search) ||
        mwa.menu.menuDescription?.toLowerCase().includes(search)
      );
    }

    if (this.showOnlyGranted) {
      filtered = filtered.filter(mwa => mwa.hasMenuAccess);
    }

    return filtered;
  }

  getGrantedActionsCount(menuWithActions: MenuWithActions): number {
    return menuWithActions.actions.filter(a => a.granted).length;
  }

  get menusWithAccessCount(): number {
    return this.menusWithActions.filter(mwa => mwa.hasMenuAccess).length;
  }

  get totalPermissionsGranted(): number {
    return this.menusWithActions.reduce(
      (sum, mwa) => sum + this.getGrantedActionsCount(mwa),
      0
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.showOnlyGranted = false;
  }

  refreshPermissions(): void {
    if (this.selectedTenantRoleId) {
      this.loadPermissionsForRole(this.selectedTenantRoleId);
      // this.toastr.success('Permissions refreshed', 'Success');
    }
  }

  toggleAddMenuModal = () => {
    this.showMenuAddModal = !this.showMenuAddModal;
  }

  addMenu(menuName: string, menuDescription: string): void {
    this.loading = true;
    const menuPayload: MenuCreateRequest = {
      menuName: menuName,
      menuDescription: menuDescription,
    };
    
    this.menuService.createMenu(menuPayload).subscribe({
      next: (response) => {
        const tenantId: number = this.selectedTenantId || 0;
        this.loadPermissionsForRole(tenantId);
        this.loading = false;
        this.toggleAddMenuModal();
        this.menuName = "";
        this.menuDescription = "";
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create menu', 'Error');
        this.loading = false;
      }
    });
  }
}