// components/super-admin-society-manager/super-admin-society-manager.component.ts

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/service/tenant.service';
import { UserService } from '../../core/service/user.service';
import { Tenant, User , Page , PaginatedResponse, UserWithRoles , Role } from '../../types/types';
import { UserRoleService } from '../../core/service/user-role-manager-service';

@Component({
  selector: 'app-super-admin-society-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  successMessage = signal('');
  errorMessage = signal('');
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

  constructor(
    private tenantService: TenantService,
    private userService: UserService,
    private userRoleService : UserRoleService
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
        this.showError('Failed to load societies');
        this.loading.set(false);
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
  // loadUsers(): void {
  //   const tenantId = this.selectedTenantId();
  //   if (!tenantId) return;

  //   this.loadingUsers.set(true);
    
  //   this.userService.searchUsers(
  //     this.searchName() || undefined,
  //     this.searchEmail() || undefined,
  //     this.currentPage(),
  //     this.pageSize()
  //   ).subscribe({
  //     next: (response: PaginatedResponse<User>) => {
  //       // Filter users by selected tenant
  //       const filteredUsers = response.content.filter(user => user.tenantId === tenantId);
  //       this.users.set(filteredUsers);
  //       // this.totalPages.set(response.totalPages);
  //       this.totalUsers.set(filteredUsers.length);
  //       this.loadingUsers.set(false);
  //     },
  //     error: (err) => {
  //       this.showError('Failed to load users');
  //       this.loadingUsers.set(false);
  //     }
  //   });
  // }

    loadUsers(): void {
         const tenantId = this.selectedTenantId();
    if (!tenantId) return;
    this.loadingUsers.set(true);
    
    this.userRoleService.getUsersByTenant(tenantId).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.loadingUsers.set(false);
        this.totalUsers.set(response.data.length)
      },
       error: (err) => {
        this.showError('Failed to load users');
        this.loadingUsers.set(false);
      }
    });
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
   * Pagination
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadUsers();
    }
  }

  /**
   * Create new tenant
   */
  createTenant(): void {
    const name = this.newTenantName().trim();
    if (!name) {
      this.showError('Please enter a society name');
      return;
    }

    this.loading.set(true);

    this.tenantService.createTenant(name).subscribe({
      next: (response) => {
        this.showSuccess('Society created successfully!');
        this.newTenantName.set('');
        this.showCreateTenant.set(false);
        this.loadTenants();
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to create society');
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

  /**
   * Assign admin to user
   */
  assignAdmin(user: UserWithRoles): void {
    if (!confirm(`Assign ${user.name} as admin of ${this.selectedTenant()?.name}?`)) {
      return;
    }

    this.processingUserId.set(user.id);
    
    this.assignRole(user);
  

    setTimeout(() => {
      this.showSuccess(`${user.name} assigned as admin successfully!`);
      this.processingUserId.set(null);
      this.loadUsers();
    }, 1000);
  }

   removeAdmin(user: UserWithRoles): void {
    if (!confirm(`Remove ${user.name} as admin of ${this.selectedTenant()?.name}?`)) {
      return;
    }

    this.processingUserId.set(user.id);
    
    this.removeRole(user);
  

    setTimeout(() => {
      this.showSuccess(`${user.name} removed as admin successfully!`);
      this.processingUserId.set(null);
      this.loadUsers();
    }, 1000);
  }

  assignRole(user: UserWithRoles): void {

     const roleId = 1;

    this.userRoleService.assignRoleToUser(user.id, roleId).subscribe({
      next: (response) => {
        // Update local state
        if (!user.assignedRoleIds) {
          user.assignedRoleIds = [];
        }
        if (!user.assignedRoleNames) {
          user.assignedRoleNames = [];
        }
        
        user.assignedRoleIds.push(roleId);
        user.assignedRoleNames.push("ADMIN");
        
        this.showSuccess(`Role ADMIN assigned to ${user.name}`);
      },
      error: (err) => {
        this.showError(`Failed to assign role: ${err.error?.message || 'Unknown error'}`);

      }
    });
  }

    removeRole(user: UserWithRoles): void {
           const roleId = 1;
    this.userRoleService.removeRoleFromUser(user.id, roleId).subscribe({
      next: (response) => {
        // Update local state
        if (user.assignedRoleIds) {
          user.assignedRoleIds = user.assignedRoleIds.filter(id => id !== roleId);
        }
        if (user.assignedRoleNames) {
          user.assignedRoleNames = user.assignedRoleNames.filter(name => name !== "ADMIN");
        }
        
        this.showSuccess(`Role ADMIN removed from ${user.name}`);
      },
      error: (err) => {
        this.showError(`Failed to remove role: ${err.error?.message || 'Unknown error'}`);
    
      }
    });
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: UserWithRoles): boolean {
    console.log("USER",user)
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
   * Show success message
   */
  showSuccess(message: string): void {
    this.successMessage.set(message);
    this.errorMessage.set('');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.errorMessage.set(message);
    this.successMessage.set('');
    setTimeout(() => this.errorMessage.set(''), 6000);
  }

  /**
   * Get filtered users count
   */
  get filteredUsersCount(): number {
    return this.users().length;
  }
}