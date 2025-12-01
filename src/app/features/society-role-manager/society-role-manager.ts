import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../core/service/tenant.service';
import { RoleService } from '../../core/service/role.service';
import { TenantRoleService } from '../../core/service/tenant-role.service';
import { Role, Tenant, TenantRoles, TenantWithRoles } from '../../types/types';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule, NgModel } from '@angular/forms';
@Component({
  selector: 'app-society-role-manager',
  standalone: true,
  imports: [CommonModule , FormsModule,],
  templateUrl: './society-role-manager.html',
  styleUrl: './society-role-manager.css'
})
export class SocietyRoleManager implements OnInit {
  roles: Array<Role> = [];
  tenants: Array<TenantWithRoles> = [];
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showAddRoleModal : boolean = false;
  roleName : string = ""
  constructor(
    private tenantService: TenantService,
    private roleService: RoleService,
    private tenantRoleService: TenantRoleService
  ) {}
  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void {
    this.loading = true;
    forkJoin({
      roles: this.roleService.getAllRoles(),
      tenants: this.tenantService.getAllTenants()
    }).subscribe({
      next: (result) => {
        this.roles = result.roles.data;
        this.tenants = result.tenants.data.map(tenant => ({
          ...tenant,
          assignedRoles: []
        }));
        console.log("LOAD TENANT ROLES",this.roles,this.tenants)
        // Load assigned roles for each tenant
        this.loadTenantRoles();
      },
      error: (err) => {
        this.showError('Failed to load data');
        this.loading = false;
      }
    });
  }
  loadTenantRoles(): void {
    const roleRequests = this.tenants.map(tenant =>
      this.tenantRoleService.getRolesForTenant(tenant.id)
    );
    forkJoin(roleRequests).subscribe({
      next: (results) => {
        results.forEach((result, index) => {
          if (result.data && result.data.length > 0) {
          
            this.tenants[index].assignedRoles = result.data
              .map(tr => tr.role.id);
          }
        });
              console.log("LOAD TENANT ROLES",this.roles,this.tenants)
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenant roles:', err);
        this.loading = false;
      }
    });
  }
  hasRole(tenant: TenantWithRoles, roleId: number): boolean {
    console.log("hasRole",tenant)
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
    this.loading = true;
    this.tenantRoleService.assignRoleToTenant(tenant.id, role.id).subscribe({
      next: (response) => {
        if (!tenant.assignedRoles) {
          tenant.assignedRoles = [];
        }
        tenant.assignedRoles.push(role.id);
        this.showSuccess(`Role "${role.role}" assigned to "${tenant.name}"`);
        this.loading = false;
      },
      error: (err) => {
        this.showError(`Failed to assign role: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });
  }
  removeRole(tenant: TenantWithRoles, role: Role): void {
    this.loading = true;
    this.tenantRoleService.removeRoleFromTenant(tenant.id, role.id).subscribe({
      next: (response) => {
        if (tenant.assignedRoles) {
          tenant.assignedRoles = tenant.assignedRoles.filter(id => id !== role.id);
        }
        this.showSuccess(`Role "${role.role}" removed from "${tenant.name}"`);
        this.loading = false;
      },
      error: (err) => {
        this.showError(`Failed to remove role: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });
  }
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  toggleAddRoleModal = ()=>{
    this.showAddRoleModal = !this.showAddRoleModal;
  }

  addRole(role : string):void{
     this.loading = true;
    this.roleService.createRole(role).subscribe({
      next: (response) => {
        this.loadData();
        this.loading = false;
        this.toggleAddRoleModal();
      },
      error: (err) => {
        this.showError(`Failed to create role: ${err.error?.message || 'Unknown error'}`);
        this.loading = false;
      }
    });


  }

}


