
// action.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Action } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private url = `${environment.apiUrl}/action`;

  constructor(private httpClient: HttpClient) {}

  getAllActions(): Observable<ApiResponse<Array<Action>>> {
    return this.httpClient.get<ApiResponse<Array<Action>>>(`${this.url}`);
  }

  getActionById(id: number): Observable<ApiResponse<Action>> {
    return this.httpClient.get<ApiResponse<Action>>(`${this.url}/${id}`);
  }

  createAction(action: Action): Observable<ApiResponse<Action>> {
    return this.httpClient.post<ApiResponse<Action>>(`${this.url}`, action);
  }

  updateAction(id: number, action: Action): Observable<ApiResponse<Action>> {
    return this.httpClient.put<ApiResponse<Action>>(`${this.url}/${id}`, action);
  }

  deleteAction(id: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(`${this.url}/${id}`);
  }
}

