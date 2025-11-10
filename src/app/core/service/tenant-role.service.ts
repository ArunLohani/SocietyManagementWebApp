import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse, TenantRoles } from '../../types/types';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class TenantRoleService {
  url = `${environment.apiUrl}/tenant-roles`;
  constructor(private httpClient: HttpClient) {}
  // Assign a role to a tenant
  assignRoleToTenant(tenantId: number, roleId: number): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('tenantId', tenantId.toString())
      .set('roleId', roleId.toString());
    return this.httpClient.post<ApiResponse<string>>(`${this.url}/assign`, null, { params });
  }
  // Remove a role from a tenant
  removeRoleFromTenant(tenantId: number, roleId: number): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('tenantId', tenantId.toString())
      .set('roleId', roleId.toString());
    return this.httpClient.delete<ApiResponse<string>>(`${this.url}/remove`, { params });
  }
  // Get all roles for a specific tenant
  getRolesForTenant(tenantId: number): Observable<ApiResponse<Array<TenantRoles>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoles>>>(`${this.url}/tenant/${tenantId}/roles`);
  }
  // Get all tenants for a specific role
  getTenantsForRole(roleId: number): Observable<ApiResponse<Array<TenantRoles>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoles>>>(`${this.url}/role/${roleId}/tenants`);
  }
  // Get mapping by id
  findById(id: number): Observable<ApiResponse<TenantRoles>> {
    return this.httpClient.get<ApiResponse<TenantRoles>>(`${this.url}/${id}`);
  }
}