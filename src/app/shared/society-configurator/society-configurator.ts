// society-configurator.component.ts

import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, lastValueFrom } from 'rxjs';

// Services
import { RoleService } from '../../core/service/role.service';
import { MenuService } from '../../core/service/menu.service';
import { ActionService } from '../../core/service/action.service';
import { TenantService } from '../../core/service/tenant.service';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { TenantRoleMenuService } from '../../core/service/tenant-role-menu.service';
import { TenantRoleMenuActionService } from '../../core/service/tenant-role-menu-action.service';

// Types
import { Role, Menu, Action, TenantRoles } from '../../types/types';
import {
  SocietyConfigurationRole,
  SocietyConfigurationMenu,
  SocietyConfigurationAction,
  SocietySetupRequest
} from '../../types/types';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-society-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    CheckboxModule,
    BadgeModule,
    ProgressSpinnerModule
  ],
  templateUrl: './society-configurator.html',
  styleUrls: ['./society-configurator.css']
})
export class SocietyConfiguratorComponent implements OnInit {
  @Input() societyName = signal<string>('');
  @Output() onComplete = new EventEmitter<void>();
  @Output() onCancelEvent = new EventEmitter<void>();

  // Data
  availableRoles = signal<Role[]>([]);
  availableMenus = signal<Menu[]>([]);
  allActions = signal<Action[]>([]);
  
  // Configuration state
  configuredRoles = signal<SocietyConfigurationRole[]>([]);
  
  // UI state
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  showRoleDialog = signal<boolean>(false);
  showJsonPreview = signal<boolean>(false);
  newRoleName = signal<string>('');

  // Drag state
  draggedRole: Role | null = null;
  draggedMenu: Menu | null = null;

  constructor(
    private roleService: RoleService,
    private menuService: MenuService,
    private actionService: ActionService,
    private tenantService: TenantService,
    private tenantRoleService: TenantRoleService,
    private tenantRoleMenuService: TenantRoleMenuService,
    private tenantRoleMenuActionService: TenantRoleMenuActionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Load all available roles, menus, and actions
   */
  loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      roles: this.roleService.getAllRoles(),
      menus: this.menuService.getAllMenus(),
      actions: this.actionService.getAllActions()
    }).subscribe({
      next: (result) => {
        this.availableRoles.set(
          result.roles.data.filter(role => !role.role.includes("ADMIN") && !role.role.includes("SUPERADMIN"))
        );
        this.availableMenus.set(
          result.menus.data.filter(menu => menu.isActive)
        );
        this.allActions.set(
          result.actions.data.filter(action => action.isActive)
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load configuration data');
        this.loading.set(false);
        console.error('Error loading data:', err);
      }
    });
  }

  /**
   * Drag and Drop - Role
   */
  onRoleDragStart(event: DragEvent, role: Role): void {
    this.draggedRole = role;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onRoleDrop(event: DragEvent): void {
    event.preventDefault();
    
    if (this.draggedRole) {
      // Check if role already exists
      const exists = this.configuredRoles().some(
        r => r.id === this.draggedRole?.id || r.name === this.draggedRole?.role
      );

      if (exists) {
        this.toastr.warning('This role is already added');
        return;
      }

      this.availableRoles.set(
        this.availableRoles().filter(role => !(role.role == this.draggedRole?.role))
      );

      // Add role to configuration
      const newRoleConfig: SocietyConfigurationRole = {
        id: this.draggedRole.id,
        name: this.draggedRole.role,
        isNew: false,
        menus: []
      };

      this.configuredRoles.update(roles => [...roles, newRoleConfig]);
      this.toastr.success(`Role "${this.draggedRole.role}" added`);
    }

    this.draggedRole = null;
  }

  /**
   * Drag and Drop - Menu
   */
  onMenuDragStart(event: DragEvent, menu: Menu): void {
    this.draggedMenu = menu;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onMenuDrop(event: DragEvent, roleIndex: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.draggedMenu) {
      const roleConfig = this.configuredRoles()[roleIndex];
      
      // Check if menu already exists in this role
      const exists = roleConfig.menus.some(m => m.id === this.draggedMenu?.id);

      if (exists) {
        this.toastr.warning('This menu is already added to this role');
        return;
      }

      // Create menu config with all actions
      const newMenuConfig: SocietyConfigurationMenu = {
        id: this.draggedMenu.id,
        menuName: this.draggedMenu.menuName,
        menuDescription: this.draggedMenu.menuDescription,
        actions: this.allActions().map(action => ({
          id: action.id,
          action: action.action,
          granted: false
        }))
      };

      // Update the role configuration
      this.configuredRoles.update(roles => {
        const updated = [...roles];
        updated[roleIndex] = {
          ...updated[roleIndex],
          menus: [...updated[roleIndex].menus, newMenuConfig]
        };
        return updated;
      });

      this.toastr.success(`Menu "${this.draggedMenu.menuName}" added to "${roleConfig.name}"`);
    }

    this.draggedMenu = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnd(event: DragEvent): void {
    this.draggedRole = null;
    this.draggedMenu = null;
  }

  /**
   * Create new role
   */
  showCreateRoleDialog(): void {
    this.showRoleDialog.set(true);
  }

  closeRoleDialog(): void {
    this.showRoleDialog.set(false);
    this.newRoleName.set('');
  }

  createNewRole(): void {
    const roleName = this.newRoleName().trim().toUpperCase();
    
    if (!roleName) {
      this.toastr.error('Please enter a role name');
      return;
    }

    // Check if role already exists
    const exists = this.configuredRoles().some(r => r.name === roleName) ||
                   this.availableRoles().some(r => r.role === roleName);

    if (exists) {
      this.toastr.error('A role with this name already exists');
      return;
    }

    // Add new role to configuration
    const newRoleConfig: SocietyConfigurationRole = {
      name: roleName,
      isNew: true,
      menus: []
    };

    this.configuredRoles.update(roles => [...roles, newRoleConfig]);
    this.toastr.success(`New role "${roleName}" created and added`);
    this.closeRoleDialog();
  }

  /**
   * Remove role from configuration
   */
  removeRole(index: number): void {
    const roleName = this.configuredRoles()[index].name;
    this.configuredRoles.update(roles => {
      const updated = [...roles];
      updated.splice(index, 1);
      return updated;
    });
    this.toastr.info(`Role "${roleName}" removed from configuration`);
  }

  /**
   * Remove menu from role
   */
  removeMenuFromRole(roleIndex: number, menuIndex: number): void {
    const roleName = this.configuredRoles()[roleIndex].name;
    const menuName = this.configuredRoles()[roleIndex].menus[menuIndex].menuName;
    
    this.configuredRoles.update(roles => {
      const updated = [...roles];
      updated[roleIndex] = {
        ...updated[roleIndex],
        menus: updated[roleIndex].menus.filter((_, idx) => idx !== menuIndex)
      };
      return updated;
    });

    this.toastr.info(`Menu "${menuName}" removed from "${roleName}"`);
  }

  /**
   * Action toggle handler
   */
  onActionToggle(): void {
    // Just to trigger change detection
  }

  /**
   * Generate configuration JSON
   */
  generateConfigurationJSON(): SocietySetupRequest {
    const config: SocietySetupRequest = {
      societyName: this.societyName(),
      configuration: {
        roles: this.configuredRoles().map(roleConfig => ({
          roleId: roleConfig.id,
          roleName: roleConfig.name,
          isNew: roleConfig.isNew,
          menuPermissions: roleConfig.menus.map(menuConfig => ({
            menuId: menuConfig.id,
            actionIds: menuConfig.actions
              .filter(action => action.granted)
              .map(action => action.id)
          }))
        }))
      }
    };

    return config;
  }

  getConfigurationJSON(): string {
    return JSON.stringify(this.generateConfigurationJSON(), null, 2);
  }

  /**
   * Copy JSON to clipboard
   */
  copyJsonToClipboard(): void {
    const json = this.getConfigurationJSON();
    navigator.clipboard.writeText(json).then(() => {
      this.toastr.success('Configuration JSON copied to clipboard');
    }).catch(() => {
      this.toastr.error('Failed to copy to clipboard');
    });
  }

  /**
   * Validation
   */
  isValid(): boolean {
    if (this.configuredRoles().length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Statistics
   */
  getGrantedActionsCount(menuConfig: SocietyConfigurationMenu): number {
    return menuConfig.actions.filter(a => a.granted).length;
  }

  getTotalMenusCount(): number {
    return this.configuredRoles().reduce((sum, role) => sum + role.menus.length, 0);
  }

  getTotalPermissionsCount(): number {
    return this.configuredRoles().reduce((sum, role) => 
      sum + role.menus.reduce((menuSum, menu) => 
        menuSum + this.getGrantedActionsCount(menu), 0
      ), 0
    );
  }

  /**
   * Submit configuration with improved error handling and rollback capability
   */
  async onSubmit(): Promise<void> {
    if (!this.isValid()) {
      this.toastr.error('Please configure at least one role with menu permissions');
      return;
    }

    this.submitting.set(true);
    const config = this.generateConfigurationJSON();
    let createdTenantId: number | null = null;

    try {
      // Step 1: Create the tenant
      this.toastr.info('Creating society...');
      const tenantResponse = await lastValueFrom(
        this.tenantService.createTenant(config.societyName)
      );
      
      createdTenantId = tenantResponse?.data?.id;

      if (!createdTenantId) {
        throw new Error('Failed to create tenant - no ID returned');
      }

      this.toastr.success(`Society "${config.societyName}" created successfully`);

      // Step 2: Setup roles and permissions
      await this.setupRolesAndPermissions(createdTenantId, config);

      this.toastr.success('Society configuration completed successfully!', '', {
        timeOut: 5000
      });
      
      this.submitting.set(false);
      this.onComplete.emit();
      
    } catch (error: any) {
      console.error('Error during society setup:', error);
      
      // Attempt rollback if tenant was created
      if (createdTenantId) {
        this.toastr.warning('Configuration failed. Attempting to clean up...');
        await this.rollbackTenantCreation(createdTenantId);
      }

      const errorMessage = error.error?.message || error.message || 'Failed to setup society';
      this.toastr.error(errorMessage, 'Setup Failed', { timeOut: 7000 });
      this.submitting.set(false);
    }
  }

  /**
   * Rollback tenant creation if setup fails
   */
  private async rollbackTenantCreation(tenantId: number): Promise<void> {
    try {
      await lastValueFrom(this.tenantService.removeTenant(tenantId));
      this.toastr.info('Cleanup completed - society removed');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
      this.toastr.error(
        `Failed to rollback. Please manually delete tenant ID: ${tenantId}`,
        'Rollback Failed'
      );
    }
  }

  /**
   * Setup roles and permissions with improved error handling and progress tracking
   */
  private async setupRolesAndPermissions(
    tenantId: number,
    config: SocietySetupRequest
  ): Promise<void> {
    const totalRoles = config.configuration.roles.length;
    let completedRoles = 0;
    const errors: string[] = [];

    this.toastr.info(`Configuring ${totalRoles} role(s)...`);

    for (const roleConfig of config.configuration.roles) {
      try {
        await this.setupSingleRole(tenantId, roleConfig);
        
        completedRoles++;
        this.toastr.info(
          `Role "${roleConfig.roleName}" configured (${completedRoles}/${totalRoles})`
        );
        
      } catch (roleError: any) {
        const errorMsg = `Failed to configure role "${roleConfig.roleName}": ${
          roleError.error?.message || roleError.message || 'Unknown error'
        }`;
        
        console.error(errorMsg, roleError);
        errors.push(errorMsg);
        this.toastr.warning(`Skipped role "${roleConfig.roleName}" due to error`);
      }
    }

    // Summary
    if (errors.length > 0) {
      const successCount = completedRoles;
      const failureCount = errors.length;
      
      if (successCount === 0) {
        throw new Error(
          `All roles failed to configure:\n${errors.join('\n')}`
        );
      } else {
        this.toastr.warning(
          `${successCount} role(s) configured, ${failureCount} failed`,
          'Partial Success'
        );
      }
    }
  }

  /**
   * Setup a single role with all its menus and permissions
   */
  private async setupSingleRole(
    tenantId: number,
    roleConfig: {
      roleId?: number;
      roleName: string;
      isNew: boolean;
      menuPermissions: Array<{ menuId: number; actionIds: number[] }>;
    }
  ): Promise<void> {
    let roleId = roleConfig.roleId;

    // Step 1: Create role if it's new
    if (roleConfig.isNew) {
      const roleResponse = await lastValueFrom(
        this.roleService.createRole(roleConfig.roleName)
      );
      
      roleId = roleResponse?.data?.id;

      if (!roleId) {
        throw new Error(`Failed to create new role: ${roleConfig.roleName}`);
      }
    }

    if (!roleId) {
      throw new Error(`No role ID available for: ${roleConfig.roleName}`);
    }

    // Step 2: Assign role to tenant
    const tenantRoleResponse = await lastValueFrom(
      this.tenantRoleService.assignRoleToTenant(tenantId, roleId)
    );

    const tenantRole = tenantRoleResponse?.data;

    if (!tenantRole?.id) {
      throw new Error(
        `Failed to assign role "${roleConfig.roleName}" to tenant`
      );
    }

    // Step 3: Setup menu permissions
    await this.setupMenuPermissions(tenantRole.id, roleConfig.menuPermissions);
  }

  /**
   * Setup menu permissions for a tenant-role
   */
  private async setupMenuPermissions(
    tenantRoleId: number,
    menuPermissions: Array<{ menuId: number; actionIds: number[] }>
  ): Promise<void> {
    const menuErrors: string[] = [];

    for (const menuPermission of menuPermissions) {
      try {
        // Assign menu to tenant-role
        const tenantRoleMenuResponse = await lastValueFrom(
          this.tenantRoleMenuService.assignMenuToTenantRole(tenantRoleId, menuPermission.menuId)
        );

        const tenantRoleMenuId = tenantRoleMenuResponse?.data?.id;

        if (!tenantRoleMenuId) {
          throw new Error(`Failed to assign menu ID ${menuPermission.menuId}`);
        }

        // Assign actions to tenant-role-menu
        await this.setupMenuActions(tenantRoleMenuId, menuPermission.actionIds);
        
      } catch (menuError: any) {
        const errorMsg = `Menu ${menuPermission.menuId}: ${
          menuError.message || 'Failed to setup'
        }`;
        
        console.error(errorMsg, menuError);
        menuErrors.push(errorMsg);
      }
    }

    // If all menus failed, throw error to fail the role setup
    if (menuErrors.length > 0 && menuErrors.length === menuPermissions.length) {
      throw new Error(
        `All menu permissions failed:\n${menuErrors.join('\n')}`
      );
    }
  }

  /**
   * Setup actions for a tenant-role-menu
   */
  private async setupMenuActions(
    tenantRoleMenuId: number,
    actionIds: number[]
  ): Promise<void> {
    if (actionIds.length === 0) {
      return; // No actions to assign
    }

    const actionPromises = actionIds.map(actionId =>
      lastValueFrom(
        this.tenantRoleMenuActionService.assignActionToTenantRoleMenu(tenantRoleMenuId, actionId)
      ).catch(error => {
        console.error(`Failed to assign action ${actionId}:`, error);
        // Don't throw - allow partial action assignment
        return null;
      })
    );

    const results = await Promise.all(actionPromises);
    
    // Check if at least some actions were assigned
    const successfulActions = results.filter(result => result !== null);
    
    if (successfulActions.length === 0 && actionIds.length > 0) {
      console.warn(
        `No actions were successfully assigned to menu ${tenantRoleMenuId}`
      );
    }
  }

  /**
   * Cancel configuration
   */
  onCancel(): void {
    if (this.configuredRoles().length > 0) {
      if (confirm('Are you sure you want to cancel? All configuration will be lost.')) {
        this.onCancelEvent.emit();
      }
    } else {
      this.onCancelEvent.emit();
    }
  }

  toggleShowJson(): void {
    this.showJsonPreview.set(!this.showJsonPreview());
  }
}