
// menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Menu, PaginatedResponse ,MenuCreateRequest, Page} from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private url = `${environment.apiUrl}/menu`;

  constructor(private httpClient: HttpClient) {}

  getAllMenusPaginated(page : number = 0): Observable<Page<Menu>> {
    return this.httpClient.get<Page<Menu>>(`${this.url}?page=${page}`);
  }

    getAllMenus(): Observable<ApiResponse<Menu[]>> {
    return this.httpClient.get<ApiResponse<Menu[]>>(`${this.url}/getAll`);
  }


  getMenuById(id: number): Observable<ApiResponse<Menu>> {
    return this.httpClient.get<ApiResponse<Menu>>(`${this.url}/${id}`);
  }

  createMenu(menu: MenuCreateRequest): Observable<ApiResponse<Menu>> {
    return this.httpClient.post<ApiResponse<Menu>>(`${this.url}`, menu);
  }

  updateMenu(id: number, menu: Menu): Observable<ApiResponse<Menu>> {
    return this.httpClient.put<ApiResponse<Menu>>(`${this.url}/${id}`, menu);
  }

  deleteMenu(id: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(`${this.url}/${id}`);
  }
}

