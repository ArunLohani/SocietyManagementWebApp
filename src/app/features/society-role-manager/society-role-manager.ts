import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../core/service/tenant.service';
import { RoleService } from '../../core/service/role.service';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { Role, Tenant, TenantRoles, TenantWithRoles } from '../../types/types';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-society-role-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    FloatLabel,
    DialogModule,
    ProgressSpinnerModule,
    CheckboxModule,
    TableModule,
    TagModule
  ],
  templateUrl: './society-role-manager.html',
  styleUrl: './society-role-manager.css'
})
export class SocietyRoleManager implements OnInit {
  roles: Array<Role> = [];
  tenant: TenantWithRoles | null = null;
  loading: boolean = false;
  showAddRoleModal: boolean = false;
  roleName: string = "";

  constructor(
    private tenantService: TenantService,
    private roleService: RoleService,
    private tenantRoleService: TenantRoleService,
    private toastr: ToastrService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantIdFromToken()?.toString() || ''
    forkJoin({
      roles: this.roleService.getAllRoles(),
      tenant: this.tenantService.getTenantById(tenantId)
    }).subscribe({
      next: (result) => {
        this.roles = result.roles.data.filter(role=>role.role != "ADMIN");
        this.tenant = {
          ...result.tenant.data,
          assignedRoles: []
        };
        // Load assigned roles for each tenant
        this.loadTenantRoles();
      },
      error: (err) => {
        this.toastr.error('Failed to load data');
        this.loading = false;
      }
    });
  }

  loadTenantRoles(): void {
    if(!this.tenant) return;

    const roleRequests = this.tenantRoleService.getRolesForTenant(this.tenant.id)
    
    forkJoin(roleRequests).subscribe({
      next: (results) => {
        results.forEach((result, index) => {
          if (result.data && result.data.length > 0) {
            this.tenant!.assignedRoles = result.data
              .map(tr => tr.role.id);
          }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenant roles:', err);
        this.loading = false;
      }
    });
  }

  hasRole(tenant: TenantWithRoles, roleId: number): boolean {
    return tenant.assignedRoles?.includes(roleId) || false;
  }

  toggleRole(tenant: TenantWithRoles, role: Role): void {
    const hasRole = this.hasRole(tenant, role.id);
    if (hasRole) {
      this.removeRole(tenant, role);
    } else {
      this.assignRole(tenant, role);
    }
  }

  assignRole(tenant: TenantWithRoles, role: Role): void {
    this.tenantRoleService.assignRoleToTenant(tenant.id, role.id).subscribe({
      next: (response) => {
        if (!tenant.assignedRoles) {
          tenant.assignedRoles = [];
        }
        tenant.assignedRoles.push(role.id);
        this.toastr.success(`Role "${role.role}" assigned to "${tenant.name}"`);
      },
      error: (err) => {
        this.toastr.error(`Failed to assign role: ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

  removeRole(tenant: TenantWithRoles, role: Role): void {
    this.tenantRoleService.removeRoleFromTenant(tenant.id, role.id).subscribe({
      next: (response) => {
        if (tenant.assignedRoles) {
          tenant.assignedRoles = tenant.assignedRoles.filter(id => id !== role.id);
        }
        this.toastr.success(`Role "${role.role}" removed from "${tenant.name}"`);
      },
      error: (err) => {
        this.toastr.error(`Failed to remove role: ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

  toggleAddRoleModal(): void {
    this.showAddRoleModal = !this.showAddRoleModal;
    if (!this.showAddRoleModal) {
      this.roleName = '';
    }
  }

  addRole(role: string): void {
    if (!role.trim()) {
      this.toastr.error('Please enter a role name');
      return;
    }

    this.loading = true;
    this.roleService.createRole(role).subscribe({
      next: (response) => {
        this.toastr.success('Role created successfully');
        this.loadData();
        this.toggleAddRoleModal();
      },
      error: (err) => {
        this.toastr.error(`Failed to create role: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });
  }

  getAssignedRolesCount(tenant: TenantWithRoles): number {
    return tenant.assignedRoles?.length || 0;
  }
}