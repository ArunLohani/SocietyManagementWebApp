// user-role-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/service/tenant.service';
import { RoleService } from '../../core/service/role.service';
import { UserRoleService } from '../../core/service/user-role-manager-service';
import { Role, Tenant, User, UserDetails, UserWithRoles } from '../../types/types';
import { forkJoin } from 'rxjs';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-user-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-role-manager.html',
  styleUrl: './user-role-manager.css'
})
export class UserRoleManager implements OnInit {
  // Data
  tenants: Array<Tenant> = [];
  roles: Array<Role> = [];
  users: Array<UserWithRoles> = [];
  unAssignedUsers : Array<UserDetails> = []
  // Selected state
  selectedTenantId: number | null = null;
  selectedTenant: Tenant | null = null;
  selectedUser : number | null = null;
  // UI state
  loading: boolean = false;
  loadingUsers: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
   showAssignUserModal : boolean = false;
   loadingUnassignedUsers : boolean = false;
  // Search & Filter
  searchTerm: string = '';
  selectedRoleFilter: number | null = null;

  constructor(
    private tenantService: TenantService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
    private userService : UserService
, private tenantRoleService : TenantRoleService  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Load tenants and roles on component init
   */
  loadInitialData(): void {
    this.loading = true;
    
    forkJoin({
      tenants: this.tenantService.getAllTenants(),
    
    }).subscribe({
      next: (result) => {
        this.tenants = result.tenants.data;
   
        this.loading = false;
      },
      error: (err) => {
        this.showError('Failed to load initial data');
        this.loading = false;
        console.error('Error loading data:', err);
      }
    });
  }

  /**
   * Handle tenant selection
   */
  onTenantSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const tenantId = Number(selectElement.value);
    
    if (!tenantId) {
      this.selectedTenantId = null;
      this.selectedTenant = null;
      this.users = [];
      return;
    }

    this.selectedTenantId = tenantId;
    this.selectedTenant = this.tenants.find(t => t.id === tenantId) || null;
    this.loadUsersForTenant(tenantId);
    this.loadRolesForTenants(tenantId);
  }
  /**
   * Handle User selection
   */
  onUserSelect(event : Event) : void {
  const selectElement = event.target as HTMLSelectElement;
    const userId = Number(selectElement.value);
    
    if (!userId) {
      this.selectedUser = null;
      return;
    }

    this.selectedUser = userId;

  }

  /**
   * Load users with their roles for selected tenant
   */
  loadUsersForTenant(tenantId: number): void {
    this.loadingUsers = true;
    this.users = [];
    
    this.userRoleService.getUsersByTenant(tenantId).subscribe({
      next: (response) => {
        this.users = response.data;
        this.loadingUsers = false;
        
        if (this.users.length === 0) {
          this.showError('No users found in this society');
        }
      },
      error: (err) => {
        this.showError('Failed to load users');
        this.loadingUsers = false;
        console.error('Error loading users:', err);
      }
    });
  }

  loadUnassignedUsers() : void {
   this.loadingUnassignedUsers = true;
    this.unAssignedUsers = [];
    this.userService.getUnassignedUser().subscribe({
      next : (response) => {
          this.unAssignedUsers = response.data;
          this.loadingUnassignedUsers = false;

      },
      error: (err) => {
        this.showError('Failed to load users');
        this.loadingUnassignedUsers = false;
        console.error('Error loading users:', err);
      }
    })


  }


   /**
   * Load roles for selected tenant
   */
  loadRolesForTenants(tenantId: number): void {
    this.loadingUsers = true;
    this.roles = [];
    
    this.tenantRoleService.getRolesForTenant(tenantId).subscribe({
      next: (response) => {
        response.data.map(tenantRole=> this.roles.push(tenantRole.role))
        this.loadingUsers = false;
 
      },
      error: (err) => {
        this.showError('Failed to load roles');
        this.loadingUsers = false;
        console.error('Error loading roles:', err);
      }
    });
  }
  /**
   * Check if user has a specific role
   */
  hasRole(user: UserWithRoles, roleId: number): boolean {
    return user.assignedRoleIds?.includes(roleId) || false;
  }

  /**
   * Toggle role assignment
   */
  toggleRole(user: UserWithRoles, role: Role, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (isChecked) {
      this.assignRole(user, role);
    } else {
      this.removeRole(user, role);
    }
  }

  /**
   * Assign role to user
   */
  assignRole(user: UserWithRoles, role: Role): void {
    this.userRoleService.assignRoleToUser(user.id, role.id).subscribe({
      next: (response) => {
        // Update local state
        if (!user.assignedRoleIds) {
          user.assignedRoleIds = [];
        }
        if (!user.assignedRoleNames) {
          user.assignedRoleNames = [];
        }
        
        user.assignedRoleIds.push(role.id);
        user.assignedRoleNames.push(role.role);
        
        this.showSuccess(`Role "${role.role}" assigned to ${user.name}`);
      },
      error: (err) => {
        this.showError(`Failed to assign role: ${err.error?.message || 'Unknown error'}`);
        // Revert checkbox state by reloading
        if (this.selectedTenantId) {
          this.loadUsersForTenant(this.selectedTenantId);
        }
      }
    });
  }

  /**
   * Remove role from user
   */
  removeRole(user: UserWithRoles, role: Role): void {
    this.userRoleService.removeRoleFromUser(user.id, role.id).subscribe({
      next: (response) => {
        // Update local state
        if (user.assignedRoleIds) {
          user.assignedRoleIds = user.assignedRoleIds.filter(id => id !== role.id);
        }
        if (user.assignedRoleNames) {
          user.assignedRoleNames = user.assignedRoleNames.filter(name => name !== role.role);
        }
        
        this.showSuccess(`Role "${role.role}" removed from ${user.name}`);
      },
      error: (err) => {
        this.showError(`Failed to remove role: ${err.error?.message || 'Unknown error'}`);
        // Revert checkbox state by reloading
        if (this.selectedTenantId) {
          this.loadUsersForTenant(this.selectedTenantId);
        }
      }
    });
  }

  /**
   * Get filtered users based on search and role filter
   */
  get filteredUsers(): Array<UserWithRoles> {
    let filtered = [...this.users];

    // Filter by search term
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phoneNumber?.includes(search)
      );
    }

    // Filter by role
    if (this.selectedRoleFilter) {
      filtered = filtered.filter(user => 
        user.assignedRoleIds?.includes(this.selectedRoleFilter!)
      );
    }

    return filtered;
  }

  /**
   * Get users count by role
   */
  getUserCountByRole(roleId: number): number {
    return this.users.filter(user => 
      user.assignedRoleIds?.includes(roleId)
    ).length;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRoleFilter = null;
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

  /**
   * Refresh current tenant data
   */
  refreshData(): void {
    if (this.selectedTenantId) {
      this.loadUsersForTenant(this.selectedTenantId);
      this.showSuccess('Data refreshed');
    }
  }

    toggleAssignUserModal = ()=>{
    
    this.showAssignUserModal = !this.showAssignUserModal;
      if(this.showAssignUserModal){
        this.loadUnassignedUsers();
      }
  }

  assignUser(tenantId : number,userId : number):void{
     this.loading = true;
    this.tenantService.assignUserToTenant(tenantId,userId).subscribe({
      next: (response) => {
        this.loadUsersForTenant(tenantId);
        this.loading = false;
        this.toggleAssignUserModal();
      },
      error: (err) => {
        this.showError(`Failed to assign User to Society: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });

  }


}