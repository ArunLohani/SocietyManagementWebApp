// components/super-admin-society-manager/super-admin-society-manager.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/service/tenant.service';
import { UserService } from '../../core/service/user.service';
import { Tenant, UserDetails, UserWithRoles } from '../../types/types';
import { UserRoleService } from '../../core/service/user-role-manager-service';
import { ToastrService } from 'ngx-toastr';
import { PaginatorModule } from 'primeng/paginator';
// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { PaginatorState } from 'primeng/types/paginator';

@Component({
  selector: 'app-super-admin-society-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    SelectModule,
    FloatLabel,
    BadgeModule,
    DialogModule,
    ProgressSpinnerModule,
    AvatarModule,
    ChipModule,
    PaginatorModule
  ],
  templateUrl: './super-admin-society-manager.component.html',
  styleUrls: ['./super-admin-society-manager.component.css']
})
export class SuperAdminSocietyManager implements OnInit {
  // Data
  tenants = signal<Tenant[]>([]);
  users = signal<UserWithRoles[]>([]);
  
  // Selected state
  selectedTenantId = signal<number | null>(null);
  selectedTenant = signal<Tenant | null>(null);
  
  // UI state
  loading = signal(false);
  loadingUsers = signal(false);
  showCreateTenant = signal(false);
  processingUserId = signal<number | null>(null);
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  pageSize = signal(6);
  totalUsers = signal(0);
  
  // Search
  searchName = signal('');
  searchEmail = signal('');
  
  // New tenant form
  newTenantName = signal('');

  //unassigned users
  loadingUnassignedUsers = false;
    unAssignedUsers: Array<UserDetails> = [];
  
  constructor(
    private tenantService: TenantService,
    private userService: UserService,
    private userRoleService: UserRoleService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  /**
   * Load all tenants
   */
  loadTenants(): void {
    this.loading.set(true);
    
    this.tenantService.getAllTenants().subscribe({
      next: (response) => {
        this.tenants.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load societies');
        this.loading.set(false);
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
      },
      error: (err) => {
        this.toastr.error('Failed to load users', 'Error');
        this.loadingUnassignedUsers = false;
        console.error('Error loading users:', err);
      }
    });
  }


  /**
   * Handle tenant selection
   */
  onTenantSelect(tenantId: number | null): void {
    if (!tenantId) {
      this.resetTenantSelection();
      return;
    }

    this.selectedTenantId.set(tenantId);
    this.selectedTenant.set(this.tenants().find(t => t.id === tenantId) || null);
    this.currentPage.set(0);
    this.loadUsers();
  }

  /**
   * Load users for selected tenant
   */
  loadUsers(pageNumber = 0,pageSize = 6): void {
    const tenantId = this.selectedTenantId();
    if (!tenantId) return;
    
    this.loadingUsers.set(true);
    
    this.userRoleService.getUsersByTenantPaginated(tenantId , pageNumber,pageSize).subscribe({
      next: (response) => {
        this.users.set(response.content);
        this.loadingUsers.set(false);
        this.totalUsers.set(response.totalElements);
        this.currentPage.set(pageNumber);
      },
      error: (err) => {
        this.toastr.error('Failed to load users');
        this.loadingUsers.set(false);
      }
    });
  }

    onPageChange(e: PaginatorState) {
    this.loadUsers(e.page);
  }

  /**
   * Search users
   */
  onSearch(): void {
    this.currentPage.set(0);
    this.loadUsers();
  }

  /**
   * Clear search filters
   */
  clearSearch(): void {
    this.searchName.set('');
    this.searchEmail.set('');
    this.currentPage.set(0);
    this.loadUsers();
  }

  /**
   * Create new tenant
   */
  createTenant(): void {
    const name = this.newTenantName().trim();
    if (!name) {
      this.toastr.error('Please enter a society name');
      return;
    }

    this.loading.set(true);

    this.tenantService.createTenant(name).subscribe({
      next: (response) => {
        this.toastr.success('Society created successfully!');
        this.newTenantName.set('');
        this.showCreateTenant.set(false);
        this.loadTenants();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create society');
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggle create tenant section
   */
  toggleCreateTenant(): void {
    this.showCreateTenant.update(value => !value);
    if (!this.showCreateTenant()) {
      this.newTenantName.set('');
    }
  }


// Fixed method to assign tenant and admin role
assignTenantAndAdminToUnAssignedUser(user: UserDetails): void {
  if (this.selectedTenantId() == null) {
    this.toastr.error('Please select a society first.');
    return;
  }

  this.processingUserId.set(user.id);

  // First assign tenant
  this.tenantService.assignUserToTenant(this.selectedTenantId()!, user.id).subscribe({
    next: () => {
      // Then assign admin role
      this.userRoleService.assignRoleToUser(user.id, 1).subscribe({
        next: () => {
          this.toastr.success(`${user.name} assigned to society and made admin`);
          this.processingUserId.set(null);
          
          // Reload both lists
          this.loadUnassignedUsers();
          this.loadUsers();
        },
        error: (err) => {
          this.toastr.error(`Failed to assign admin role: ${err.error?.message || 'Unknown error'}`);
          this.processingUserId.set(null);
        }
      });
    },
    error: (err) => {
      this.toastr.error(`Failed to assign to society: ${err.error?.message || 'Unknown error'}`);
      this.processingUserId.set(null);
    }
  });
}

// Add signal for dialog visibility
showUnassignedUsersDialog = signal(false);

// Method to open dialog
openUnassignedUsersDialog(): void {
  this.showUnassignedUsersDialog.set(true);
  this.loadUnassignedUsers();
}

// Method to close dialog
closeUnassignedUsersDialog(): void {
  this.showUnassignedUsersDialog.set(false);
}

  /**
   * Assign admin to user
   */
  assignAdmin(user: UserWithRoles): void {
    this.processingUserId.set(user.id);
    this.assignRole(user);
  }

  /**
   * Remove admin from user
   */
  removeAdmin(user: UserWithRoles): void {
    this.processingUserId.set(user.id);
    this.removeRole(user);
  }

  assignRole(user: UserWithRoles): void {
    const roleId = 1;

    this.userRoleService.assignRoleToUser(user.id, roleId).subscribe({
      next: (response) => {
        if (!user.assignedRoleIds) {
          user.assignedRoleIds = [];
        }
        if (!user.assignedRoleNames) {
          user.assignedRoleNames = [];
        }
        
        user.assignedRoleIds.push(roleId);
        user.assignedRoleNames.push("ADMIN");
        
        this.toastr.success(`Role ADMIN assigned to ${user.name}`);
        this.processingUserId.set(null);
        this.loadUsers();
      },
      error: (err) => {
        this.toastr.error(`Failed to assign role: ${err.error?.message || 'Unknown error'}`);
        this.processingUserId.set(null);
      }
    });
  }

  removeRole(user: UserWithRoles): void {
    const roleId = 1;
    
    this.userRoleService.removeRoleFromUser(user.id, roleId).subscribe({
      next: (response) => {
        if (user.assignedRoleIds) {
          user.assignedRoleIds = user.assignedRoleIds.filter(id => id !== roleId);
        }
        if (user.assignedRoleNames) {
          user.assignedRoleNames = user.assignedRoleNames.filter(name => name !== "ADMIN");
        }
        
        this.toastr.success(`Role ADMIN removed from ${user.name}`);
        this.processingUserId.set(null);
        this.loadUsers();
      },
      error: (err) => {
        this.toastr.error(`Failed to remove role: ${err.error?.message || 'Unknown error'}`);
        this.processingUserId.set(null);
      }
    });
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: UserWithRoles): boolean {
    return user.assignedRoleNames?.includes('ADMIN') || false;
  }

  /**
   * Reset tenant selection
   */
  resetTenantSelection(): void {
    this.selectedTenantId.set(null);
    this.selectedTenant.set(null);
    this.users.set([]);
    this.searchName.set('');
    this.searchEmail.set('');
  }

  /**
   * Get user initials
   */
  getUserInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  /**
   * Get filtered users count
   */
  get filteredUsersCount(): number {
    return this.users().length;
  }
}