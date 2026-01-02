// core/service/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, User, UserDetails, PaginatedResponse ,Page } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = `${environment.apiUrl}/user`;

  constructor(private httpClient: HttpClient) {}


  getUserById(id: number): Observable<ApiResponse<UserDetails>> {
    return this.httpClient.get<ApiResponse<UserDetails>>(`${this.url}/${id}`);
  }

  searchUsers(
    name?: string,
    email?: string,
    page: number = 0,
    limit: number = 6
  ): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name) {
      params = params.set('name', name);
    }
    if (email) {
      params = params.set('email', email);
    }

    return this.httpClient.get<PaginatedResponse<User>>(`${this.url}/search`, { params });
  }


  searchUsersList(
    name?: string,
    email?: string
  ): Observable<ApiResponse<User>> {
    let params = new HttpParams()

    if (name) {
      params = params.set('name', name);
    }
    if (email) {
      params = params.set('email', email);
    }

    return this.httpClient.get<ApiResponse<User>>(`${this.url}/search-list`, { params });
  }



  updateUser(id: number, user: User): Observable<ApiResponse<UserDetails>> {
    return this.httpClient.put<ApiResponse<UserDetails>>(`${this.url}/${id}`, user);
  }

  getUnassignedUser() : Observable<ApiResponse<Array<UserDetails>>>{
        return this.httpClient.get<ApiResponse<Array<UserDetails>>>(`${this.url}/not-assigned`);
  }

  checkTenancyStatus():Observable<ApiResponse<boolean>>{
    return this.httpClient.get<ApiResponse<boolean>>(`${this.url}/checkStatus`);
  }
}


