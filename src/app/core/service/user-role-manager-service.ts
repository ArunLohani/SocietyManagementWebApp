
// user-role-manager.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, UserWithRoles } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private url = `${environment.apiUrl}/user-roles`;

  constructor(private httpClient: HttpClient) {}

  getUsersByTenant(tenantId: number): Observable<ApiResponse<Array<UserWithRoles>>> {
    return this.httpClient.get<ApiResponse<Array<UserWithRoles>>>(
      `${this.url}/tenant/${tenantId}`
    );
  }

  assignRoleToUser(userId: number, roleId: number): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      `${this.url}/assign`,
      { userId, roleId }
    );
  }

  removeRoleFromUser(userId: number, roleId: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(
      `${this.url}/remove`,
      { params: { userId: userId.toString(), roleId: roleId.toString() } }
    );
  }

  getUserRoles(userId: number): Observable<ApiResponse<Array<any>>> {
    return this.httpClient.get<ApiResponse<Array<any>>>(
      `${this.url}/user/${userId}`
    );
  }
}