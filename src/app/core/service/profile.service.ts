
// action.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Action, UserDetails } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private url = `${environment.apiUrl}/profile/me`;

  constructor(private httpClient: HttpClient) {}

  getMyProfile() : Observable<ApiResponse<UserDetails>> {
    return this.httpClient.get<ApiResponse<UserDetails>>(`${this.url}`);
  }

}