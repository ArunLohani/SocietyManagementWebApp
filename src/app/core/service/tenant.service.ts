import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Tenant } from '../../types/types';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  url = `${environment.apiUrl}/tenant`;

  constructor(private httpClient: HttpClient) {
  }

  getAllTenants(): Observable<ApiResponse<Array<Tenant>>> {
    return this.httpClient.get<ApiResponse<Array<Tenant>>>(`${this.url}`);
  }

  getTenantById(id: string): Observable<ApiResponse<Tenant>> {
    return this.httpClient.get<ApiResponse<Tenant>>(`${this.url}/${id}`);
  }

  createTenant(tenant: string): Observable<ApiResponse<Tenant>> {
    return this.httpClient.post<ApiResponse<Tenant>>(`${this.url}`, tenant);
  }

  assignUserToTenant(tenantId: number, userId: number): Observable<ApiResponse<Tenant>> {
    return this.httpClient.post<ApiResponse<Tenant>>(`${this.url}/addUser`, {
      tenantId,
      userId
    });

  }
    removeUserFromTenant(tenantId: number, userId: number): Observable<ApiResponse<Tenant>> {
    return this.httpClient.post<ApiResponse<Tenant>>(`${this.url}/removeUser`, {
      tenantId,
      userId
    });

  }

  removeTenant(tenantId:number): Observable<ApiResponse<Tenant>> {
    return this.httpClient.delete<ApiResponse<Tenant>>(`${this.url}/${tenantId}`);
  }
}