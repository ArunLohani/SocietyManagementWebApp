import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/service/tenant.service';
import { RoleService } from '../../core/service/role.service';
import { UserRoleService } from '../../core/service/user-role-manager-service';
import { Role, Tenant, User, UserDetails, UserWithRoles } from '../../types/types';
import { forkJoin, map } from 'rxjs';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';
import { ToastrService } from 'ngx-toastr';

// PrimeNG Imports
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-user-role-manager',
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
    ProgressSpinnerModule,
    MessageModule,
    Tooltip
  ],
  templateUrl: './user-role-manager.html',
  styleUrl: './user-role-manager.css'
})
export class UserRoleManager implements OnInit {
  // Data
  tenant: Tenant | null = null;
  roles: Array<Role> = [];
  users: Array<UserWithRoles> = [];
  unAssignedUsers: Array<UserDetails> = [];
unAssignedUsersOption: { name: string; email: string; id: number }[] = [];


  // Selected state
  selectedTenantId: number | null = null;
  selectedTenant: Tenant | null = null;
  selectedUser: number | null = null;
  userToRemove: UserWithRoles | null = null;
  
  // UI state
  loading: boolean = false;
  loadingUsers: boolean = false;
  showAssignUserModal: boolean = false;
  loadingUnassignedUsers: boolean = false;
  showRemoveUserModal: boolean = false;
  
  // Search & Filter
  searchTerm: string = '';
  selectedRoleFilter: number | null = null;

  constructor(
    private tenantService: TenantService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
    private userService: UserService,
    private tenantRoleService: TenantRoleService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantIdFromToken()?.toString();
  
    if (tenantId) {
      this.tenantService.getTenantById(tenantId).subscribe({
        next: (result) => {
          this.tenant = result.data;
          this.selectedTenantId = this.tenant.id;
          this.selectedTenant = this.tenant;
          this.loadUsersForTenant(this.tenant.id);
          this.loadRolesForTenants(this.tenant.id);
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error('Failed to load initial data', 'Error');
          this.loading = false;
          console.error('Error loading data:', err);
        }
      });
    }
  }

  onUserSelect(event: any): void {
    this.selectedUser = event.value;
  }

  loadUsersForTenant(tenantId: number): void {
    this.loadingUsers = true;
    this.users = [];
    
    this.userRoleService.getUsersByTenant(tenantId).subscribe({
      next: (response) => {
        this.users = response.data;
        this.loadingUsers = false;
        
        if (this.users.length === 0) {
          this.toastr.info('No users found in this society', 'Info');
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load users', 'Error');
        this.loadingUsers = false;
        console.error('Error loading users:', err);
      }
    });
  }

loadUnassignedUsers(): void {
  this.loadingUnassignedUsers = true;
  this.unAssignedUsers = [];
  
  this.userService.getUnassignedUser().subscribe({
    next: (response) => {
      this.unAssignedUsers = response.data;
      this.loadingUnassignedUsers = false;
      this.unAssignedUsersOption = this.unAssignedUsers.map(unassignUser => ({
        name: unassignUser.name,
        email: unassignUser.email,  // Add email
        id: unassignUser.id
      }));
      
      console.log("unassignedUsers", this.unAssignedUsersOption);
    },
    error: (err) => {
      this.toastr.error('Failed to load users', 'Error');
      this.loadingUnassignedUsers = false;
      console.error('Error loading users:', err);
    }
  });
}
  loadRolesForTenants(tenantId: number): void {
    this.loadingUsers = true;
    this.roles = [];
    
    this.tenantRoleService.getRolesForTenant(tenantId).subscribe({
      next: (response) => {
        response.data.filter(tenantRole => tenantRole.role.role != 'ADMIN').map(tenantRole => this.roles.push(tenantRole.role));
        this.loadingUsers = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load roles', 'Error');
        this.loadingUsers = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  hasRole(user: UserWithRoles, roleId: number): boolean {
    return Array.isArray(user.assignedRoleIds) && user.assignedRoleIds.includes(roleId);
  }

  isAdmin(user: UserWithRoles): boolean {
    return Array.isArray(user.assignedRoleNames) && 
           user.assignedRoleNames.some(role => role.toUpperCase() === 'ADMIN');
  }

  toggleRole(user: UserWithRoles, role: Role, event: any): void {
    const isChecked = event.checked;

    if (isChecked) {
      this.assignRole(user, role);
    } else {
      this.removeRole(user, role);
    }
  }

  assignRole(user: UserWithRoles, role: Role): void {
    this.userRoleService.assignRoleToUser(user.id, role.id).subscribe({
      next: (response) => {
        if (!user.assignedRoleIds) {
          user.assignedRoleIds = [];
        }
        if (!user.assignedRoleNames) {
          user.assignedRoleNames = [];
        }
        
        user.assignedRoleIds.push(role.id);
        user.assignedRoleNames.push(role.role);
        
        this.toastr.success(`Role "${role.role}" assigned to ${user.name}`, 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to assign role', 'Error');
        if (this.selectedTenantId) {
          this.loadUsersForTenant(this.selectedTenantId);
        }
      }
    });
  }

  removeRole(user: UserWithRoles, role: Role): void {
    this.userRoleService.removeRoleFromUser(user.id, role.id).subscribe({
      next: (response) => {
        if (user.assignedRoleIds) {
          user.assignedRoleIds = user.assignedRoleIds.filter(id => id !== role.id);
        }
        if (user.assignedRoleNames) {
          user.assignedRoleNames = user.assignedRoleNames.filter(name => name !== role.role);
        }
        
        this.toastr.success(`Role "${role.role}" removed from ${user.name}`, 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to remove role', 'Error');
        if (this.selectedTenantId) {
          this.loadUsersForTenant(this.selectedTenantId);
        }
      }
    });
  }

  openRemoveUserModal(user: UserWithRoles): void {
    if (this.isAdmin(user)) {
      this.toastr.warning('Admin users cannot be removed from the society', 'Warning');
      return;
    }
    this.userToRemove = user;
    this.showRemoveUserModal = true;
  }

  closeRemoveUserModal(): void {
    this.showRemoveUserModal = false;
    this.userToRemove = null;
  }

  confirmRemoveUser(): void {
    if (!this.userToRemove || !this.selectedTenantId) {
      return;
    }

    this.loading = true;
    this.tenantService.removeUserFromTenant(this.selectedTenantId, this.userToRemove.id).subscribe({
      next: (response) => {
        this.toastr.success(`${this.userToRemove!.name} removed from society successfully`, 'Success');
        this.loadUsersForTenant(this.selectedTenantId!);
        this.closeRemoveUserModal();
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to remove user from society', 'Error');
        this.loading = false;
      }
    });
  }

  get filteredUsers(): Array<UserWithRoles> {
    let filtered = [...this.users];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phoneNumber?.includes(search)
      );
    }

    if (this.selectedRoleFilter) {
      filtered = filtered.filter(user => 
        Array.isArray(user.assignedRoleIds) && user.assignedRoleIds.includes(this.selectedRoleFilter!)
      );
    }

    return filtered;
  }

  getUserCountByRole(roleId: number): number {
    return this.users.filter(user => 
      Array.isArray(user.assignedRoleIds) && user.assignedRoleIds.includes(roleId)
    ).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRoleFilter = null;
  }

  refreshData(): void {
    if (this.selectedTenantId) {
      this.loadUsersForTenant(this.selectedTenantId);
      this.toastr.success('Data refreshed', 'Success');
    }
  }

toggleAssignUserModal = () => {
  this.showAssignUserModal = !this.showAssignUserModal;
  if (this.showAssignUserModal) {
    this.selectedUser = null;  // Reset selection
    this.unAssignedUsersOption = [];  // Clear previous options
    this.loadUnassignedUsers();
  }
}

  assignUser(tenantId: number, userId: number): void {
    this.loading = true;
    this.tenantService.assignUserToTenant(tenantId, userId).subscribe({
      next: (response) => {
        this.loadUsersForTenant(tenantId);
        this.loading = false;
        this.toggleAssignUserModal();
        this.toastr.success('User assigned to society successfully', 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to assign user to society', 'Error');
        this.loading = false;
      }
    });
  }
}