import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Role, Tenant } from '../../types/types';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoleService {
     url = `${environment.apiUrl}/role`;

  constructor(private httpClient: HttpClient) {
  }

    getAllRoles(): Observable<ApiResponse<Array<Role>>> {
      return this.httpClient.get<ApiResponse<Array<Role>>>(`${this.url}`);
    }

      getRoleById(id : string): Observable<ApiResponse<Role>> {
      return this.httpClient.get<ApiResponse<Role>>(`${this.url}/id`);
    }

    createRole(role : string) : Observable<ApiResponse<Role>> {
      return this.httpClient.post<ApiResponse<Role>>(`${this.url}`,role);
    }

}
