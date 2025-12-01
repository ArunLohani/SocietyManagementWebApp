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
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-user-role-permission-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule],
  templateUrl: './user-role-permission-manager.html',
  styleUrl: './user-role-permission-manager.css'
})
export class UserRolePermissionManager implements OnInit {
  // Data
  tenants: Array<Tenant> = [];
  tenantRoles: Array<TenantRoles> = [];
  allMenus: Array<Menu> = [];
  allActions: Array<Action> = [];
  menusWithActions: Array<MenuWithActions> = [];
  menuName: string = "";
  menuDescription: string = "";
  menuIsActive = true

  // Selected state
  selectedTenantId: number | null = null;
  selectedTenant: Tenant | null = null;
  selectedTenantRoleId: number | null = null;
  selectedTenantRole: TenantRoles | null = null;

  // UI state
  loading: boolean = false;
  loadingPermissions: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
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
    private tenantRoleMenuActionService: TenantRoleMenuActionService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Load tenants, menus, and actions on init
   */
  loadInitialData(): void {
    this.loading = true;

    forkJoin({
      tenants: this.tenantService.getAllTenants(),
      menus: this.menuService.getAllMenusPaginated(),
      actions: this.actionService.getAllActions()
    }).subscribe({
      next: (result) => {
        this.tenants = result.tenants.data.filter(t => t.isActive);
        this.allMenus = result.menus.content.filter(m => m.isActive);
        this.allActions = result.actions.data.filter(a => a.isActive);
        this.row = result.menus.numberOfElements;

        this.totalRecords = result.menus.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.showError('Failed to load initial data');
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
        this.showError('Failed to load menu');
        this.loading = false;
        console.error('Error loading data:', err);
      },
    })

  }

  onPageChange(event: PaginatorState) {
    console.log("BEFORE", this.row, this.totalRecords)
    this.loadMenus(event)
    this.row = event.rows ?? 6;
    this.first = event.first ?? 0;

  }
  /**
   * Handle tenant selection
   */
  onTenantSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const tenantId = Number(selectElement.value);

    if (!tenantId) {
      this.resetTenantSelection();
      return;
    }

    this.selectedTenantId = tenantId;
    this.selectedTenant = this.tenants.find(t => t.id === tenantId) || null;
    this.selectedTenantRoleId = null;
    this.selectedTenantRole = null;
    this.menusWithActions = [];
    this.loadRolesForTenant(tenantId);
  }

  /**
   * Load roles for selected tenant
   */
  loadRolesForTenant(tenantId: number): void {
    this.loadingPermissions = true;
    this.tenantRoles = [];

    this.tenantRoleService.getRolesForTenant(tenantId).subscribe({
      next: (response) => {
        this.tenantRoles = response.data.filter(tr => tr.isActive);
        this.loadingPermissions = false;

        if (this.tenantRoles.length === 0) {
          this.showError('No roles assigned to this society');
        }
      },
      error: (err) => {
        this.showError('Failed to load roles');
        this.loadingPermissions = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  /**
   * Handle role selection
   */
  onRoleSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const tenantRoleId = Number(selectElement.value);

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

  /**
   * Load all permissions for the selected role
   */
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
        this.showError('Failed to load permissions');
        this.loadingPermissions = false;
        console.error('Error loading permissions:', err);
      }
    });
  }

  /**
   * Build the menu-actions structure for display
   */
  buildMenuActionsStructure(assignedMenus: TenantRoleMenu[]): void {
    this.menusWithActions = this.allMenus.map(menu => {
      const tenantRoleMenu = assignedMenus.find(
        trm => trm.menu.id === menu.id
      );

      const menuWithActions: MenuWithActions = {
        menu: menu,
        tenantRoleMenuId: tenantRoleMenu?.id || null,
        hasMenuAccess: !!tenantRoleMenu,
        actions: []
      };

      // Load actions for this menu if it has access
      if (tenantRoleMenu) {
        this.loadActionsForMenu(tenantRoleMenu.id, menuWithActions);
      } else {
        // No menu access, show all actions as not granted
        menuWithActions.actions = this.allActions.map(action => ({
          action: action,
          granted: false,
          tenantRoleMenuActionId: null
        }));
      }

      return menuWithActions;
    });
  }

  /**
   * Load actions for a specific menu
   */
  loadActionsForMenu(tenantRoleMenuId: number, menuWithActions: MenuWithActions): void {
    this.tenantRoleMenuActionService.getActionsForTenantRoleMenu(tenantRoleMenuId).subscribe({
      next: (response) => {
        const grantedActions = response.data.filter(trma => trma.isActive);

        menuWithActions.actions = this.allActions.map(action => {
          const granted = grantedActions.find(
            ga => ga.action.id === action.id
          );
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

  /**
   * Toggle menu access
   */
  toggleMenuAccess(menuWithActions: MenuWithActions, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (!this.selectedTenantRoleId) return;

    this.processingMenuId = menuWithActions.menu.id;

    if (isChecked) {
      this.grantMenuAccess(menuWithActions);
    } else {
      this.revokeMenuAccess(menuWithActions);
    }
  }

  /**
   * Grant menu access
   */
  grantMenuAccess(menuWithActions: MenuWithActions): void {
    if (!this.selectedTenantRoleId) return;

    this.tenantRoleMenuService
      .assignMenuToTenantRole(this.selectedTenantRoleId, menuWithActions.menu.id)
      .subscribe({
        next: (response) => {
          menuWithActions.hasMenuAccess = true;
          menuWithActions.tenantRoleMenuId = response.data.id;

          // Initialize actions as not granted
          menuWithActions.actions = this.allActions.map(action => ({
            action: action,
            granted: false,
            tenantRoleMenuActionId: null
          }));

          this.processingMenuId = null;
          this.refreshPermissions();
          this.showSuccess(`Menu "${menuWithActions.menu.menuName}" access granted`);
        },
        error: (err) => {
          this.showError(`Failed to grant menu access: ${err.error?.message || 'Unknown error'}`);
          this.processingMenuId = null;
          this.refreshPermissions();
        }
      });
  }

  /**
   * Revoke menu access
   */
  revokeMenuAccess(menuWithActions: MenuWithActions): void {
    if (!this.selectedTenantRoleId) return;

    this.tenantRoleMenuService
      .removeMenuFromTenantRole(this.selectedTenantRoleId, menuWithActions.menu.id)
      .subscribe({
        next: () => {
          menuWithActions.hasMenuAccess = false;
          menuWithActions.tenantRoleMenuId = null;

          // Reset all actions
          menuWithActions.actions = this.allActions.map(action => ({
            action: action,
            granted: false,
            tenantRoleMenuActionId: null
          }));

          this.processingMenuId = null;
          this.refreshPermissions();
          this.showSuccess(`Menu "${menuWithActions.menu.menuName}" access revoked`);
        },
        error: (err) => {
          this.showError(`Failed to revoke menu access: ${err.error?.message || 'Unknown error'}`);
          this.processingMenuId = null;
          this.refreshPermissions();
        }
      });
  }

  /**
   * Toggle action permission
   */
  toggleAction(
    menuWithActions: MenuWithActions,
    actionPermission: ActionPermission,
    event: Event
  ): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (!menuWithActions.tenantRoleMenuId) {
      checkbox.checked = false;
      this.showError('Please grant menu access first');
      return;
    }

    this.processingActionId = actionPermission.action.id;

    if (isChecked) {
      this.grantActionPermission(menuWithActions, actionPermission);
    } else {
      this.revokeActionPermission(menuWithActions, actionPermission);
    }
  }

  /**
   * Grant action permission
   */
  grantActionPermission(
    menuWithActions: MenuWithActions,
    actionPermission: ActionPermission
  ): void {
    if (!menuWithActions.tenantRoleMenuId) return;

    this.tenantRoleMenuActionService
      .assignActionToTenantRoleMenu(
        menuWithActions.tenantRoleMenuId,
        actionPermission.action.id
      )
      .subscribe({
        next: (response) => {
          actionPermission.granted = true;
          actionPermission.tenantRoleMenuActionId = response.data.id;
          this.processingActionId = null;
          this.showSuccess(
            `${actionPermission.action.action} permission granted for ${menuWithActions.menu.menuName}`
          );
        },
        error: (err) => {
          this.showError(`Failed to grant permission: ${err.error?.message || 'Unknown error'}`);
          this.processingActionId = null;
          this.refreshPermissions();
        }
      });
  }

  /**
   * Revoke action permission
   */
  revokeActionPermission(
    menuWithActions: MenuWithActions,
    actionPermission: ActionPermission
  ): void {
    if (!menuWithActions.tenantRoleMenuId) return;
    console.log("INREVOKEACTION");

    this.tenantRoleMenuActionService
      .removeActionFromTenantRoleMenu(
        menuWithActions.tenantRoleMenuId,
        actionPermission.action.id
      )
      .subscribe({

        next: () => {
          console.log("INSUBSCRIBE");

          actionPermission.granted = false;
          actionPermission.tenantRoleMenuActionId = null;
          this.processingActionId = null;
          this.showSuccess(
            `${actionPermission.action.action} permission revoked for ${menuWithActions.menu.menuName}`
          );
        },
        error: (err) => {
          console.log(err)
          this.processingActionId = null;
          this.refreshPermissions();
          this.showError(`Failed to revoke permission: ${err.error?.message || 'Unknown error'}`);
        },
      });
  }

  /**
   * Get filtered menus based on search and filter
   */
  get filteredMenus(): Array<MenuWithActions> {
    let filtered = [...this.menusWithActions];

    // Filter by search term
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mwa =>
        mwa.menu.menuName.toLowerCase().includes(search) ||
        mwa.menu.menuDescription?.toLowerCase().includes(search)
      );
    }

    // Filter by granted access
    if (this.showOnlyGranted) {
      filtered = filtered.filter(mwa => mwa.hasMenuAccess);
    }

    return filtered;
  }

  /**
   * Get count of granted actions for a menu
   */
  getGrantedActionsCount(menuWithActions: MenuWithActions): number {
    return menuWithActions.actions.filter(a => a.granted).length;
  }

  /**
   * Get count of menus with access
   */
  get menusWithAccessCount(): number {
    return this.menusWithActions.filter(mwa => mwa.hasMenuAccess).length;
  }

  /**
   * Get total permissions granted
   */
  get totalPermissionsGranted(): number {
    return this.menusWithActions.reduce(
      (sum, mwa) => sum + this.getGrantedActionsCount(mwa),
      0
    );
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.showOnlyGranted = false;
  }

  /**
   * Reset tenant selection
   */
  resetTenantSelection(): void {
    this.selectedTenantId = null;
    this.selectedTenant = null;
    this.selectedTenantRoleId = null;
    this.selectedTenantRole = null;
    this.tenantRoles = [];
    this.menusWithActions = [];
  }

  /**
   * Refresh permissions
   */
  refreshPermissions(): void {
    if (this.selectedTenantRoleId) {
      this.loadPermissionsForRole(this.selectedTenantRoleId);
      this.showSuccess('Permissions refreshed');
    }
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }


  toggleAddMenuModal = () => {
    this.showMenuAddModal = !this.showMenuAddModal;
  }

  addMenu(menuName: string, menuDescription: string): void {
    this.loading = true;
    const menuPayload: MenuCreateRequest = {

      menuName: menuName,
      menuDescription: menuDescription,
    }
    this.menuService.createMenu(menuPayload).subscribe({
      next: (response) => {
        const tenantId: number = this.selectedTenantId || 0
        this.loadPermissionsForRole(tenantId);
        this.loading = false;
        this.toggleAddMenuModal();
        this.menuName = "";
        this.menuDescription = ""
      },
      error: (err) => {
        this.showError(`Failed to create role: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });


  }

}