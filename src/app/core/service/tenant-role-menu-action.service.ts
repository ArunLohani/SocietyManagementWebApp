// tenant-role-menu-action.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, TenantRoleMenuAction } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class TenantRoleMenuActionService {
  private url = `${environment.apiUrl}/tenantRoleMenuAction`;

  constructor(private httpClient: HttpClient) {}

  // Assign an action to a tenant role menu
  assignActionToTenantRoleMenu(
    tenantRoleMenuId: number,
    actionId: number
  ): Observable<ApiResponse<TenantRoleMenuAction>> {
    const params = new HttpParams()
      .set('tenantRoleMenuId', tenantRoleMenuId.toString())
      .set('actionId', actionId.toString());
    return this.httpClient.post<ApiResponse<TenantRoleMenuAction>>(
      `${this.url}/assign`,
      null,
      { params }
    );
  }

  // Remove an action from a tenant role menu
  removeActionFromTenantRoleMenu(
    tenantRoleMenuId: number,
    actionId: number
  ): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('tenantRoleMenuId', tenantRoleMenuId.toString())
      .set('actionId', actionId.toString());
    return this.httpClient.delete<ApiResponse<string>>(
      `${this.url}/remove`,
      { params }
    );
  }

  // Get all actions for a tenant role menu
  getActionsForTenantRoleMenu(
    tenantRoleMenuId: number
  ): Observable<ApiResponse<Array<TenantRoleMenuAction>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoleMenuAction>>>(
      `${this.url}/actions/${tenantRoleMenuId}`
    );
  }

  // Get all tenant role menus for an action
  getTenantRoleMenusForAction(
    actionId: number
  ): Observable<ApiResponse<Array<TenantRoleMenuAction>>> {
    return this.httpClient.get<ApiResponse<Array<TenantRoleMenuAction>>>(
      `${this.url}/tenantRoleMenus/${actionId}`
    );
  }

  // Get mapping by ID
  findById(id: number): Observable<ApiResponse<TenantRoleMenuAction>> {
    return this.httpClient.get<ApiResponse<TenantRoleMenuAction>>(
      `${this.url}/${id}`
    );
  }

  // Check if a tenant role menu has access to an action
  hasActionAccess(
    tenantRoleMenuId: number,
    actionId: number
  ): Observable<ApiResponse<boolean>> {
    const params = new HttpParams()
      .set('tenantRoleMenuId', tenantRoleMenuId.toString())
      .set('actionId', actionId.toString());
    return this.httpClient.get<ApiResponse<boolean>>(
      `${this.url}/hasAccess`,
      { params }
    );
  }
}