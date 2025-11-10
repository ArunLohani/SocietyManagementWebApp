
// tenant-role-menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, TenantRoleMenu } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class TenantRoleMenuService {
  private url = `${environment.apiUrl}/tenantRoleMenu`;

  constructor(private httpClient: HttpClient) {}

  // Assign a menu to a tenant role
  assignMenuToTenantRole(
    tenantRoleId: number,
    menuId: number
  ): Observable<ApiResponse<TenantRoleMenu>> {
    const params = new HttpParams()
      .set('tenantRoleId', tenantRoleId.toString())
      .set('menuId', menuId.toString());
    return this.httpClient.post<ApiResponse<TenantRoleMenu>>(
      `${this.url}/assign`,
      null,
      { params }
    );
  }

  // Remove a menu from a tenant role
  removeMenuFromTenantRole(
    tenantRoleId: number,
    menuId: number
  ): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('tenantRoleId', tenantRoleId.toString())
      .set('menuId', menuId.toString());
    return this.httpClient.delete<ApiResponse<string>>(
      `${this.url}/remove`,
      { params }
    );
  }

  // Get all menus for a tenant role
  getMenusForTenantRole(
    tenantRoleId: number
  ): Observable<ApiResponse<Array<TenantRoleMenu>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoleMenu>>>(
      `${this.url}/menus/${tenantRoleId}`
    );
  }

  // Get all tenant roles for a menu
  getTenantRolesForMenu(
    menuId: number
  ): Observable<ApiResponse<Array<TenantRoleMenu>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoleMenu>>>(
      `${this.url}/tenantRoles/${menuId}`
    );
  }

  // Get mapping by ID
  findById(id: number): Observable<ApiResponse<TenantRoleMenu>> {
    return this.httpClient.get<ApiResponse<TenantRoleMenu>>(
      `${this.url}/${id}`
    );
  }

  // Check if tenant role has menu access
  hasMenuAccess(
    tenantRoleId: number,
    menuId: number
  ): Observable<ApiResponse<boolean>> {
    const params = new HttpParams()
      .set('tenantRoleId', tenantRoleId.toString())
      .set('menuId', menuId.toString());
    return this.httpClient.get<ApiResponse<boolean>>(
      `${this.url}/hasAccess`,
      { params }
    );
  }
}

