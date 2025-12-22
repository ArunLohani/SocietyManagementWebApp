
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Action, Flat, FlatCreationRequest, FlatFilter, Page } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class FlatService {

    private url = `${environment.apiUrl}/flat`;

    constructor(private httpClient: HttpClient) { }

    getFlatById(id: number): Observable<ApiResponse<Flat>> {
        return this.httpClient.get<ApiResponse<Flat>>(`${this.url}/${id}`)
    }

    createFlat(flatCreationRequest: FlatCreationRequest): Observable<ApiResponse<Flat>> {
        return this.httpClient.post<ApiResponse<Flat>>(`${this.url}`, flatCreationRequest)
    }

    updateFlat(id: number, flatCreationRequest: FlatCreationRequest): Observable<ApiResponse<Flat>> {
        return this.httpClient.put<ApiResponse<Flat>>(`${this.url}/${id}`, flatCreationRequest)
    }

    deleteFlat(id: number): Observable<ApiResponse<Flat>> {
        return this.httpClient.delete<ApiResponse<Flat>>(`${this.url}/${id}`)
    }

    searchFlatList(filter: FlatFilter): Observable<ApiResponse<Flat[]>> {
        return this.httpClient.post<ApiResponse<Flat[]>>(`${this.url}/search-list`, filter)
    }

    searchFlat(filter: FlatFilter, pageNumber = 0, pageSize = 10): Observable<Page<Flat>> {
        return this.httpClient.post<Page<Flat>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
    }



}