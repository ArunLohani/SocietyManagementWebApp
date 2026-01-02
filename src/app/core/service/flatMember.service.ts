import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Action, Flat, FlatCreationRequest, FlatFilter, Page, FlatMember, FlatMemberAddRequest, FlatMembershipType } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class FlatMemberService {

    private url = `${environment.apiUrl}/flat-member`;

    constructor(private httpClient: HttpClient) { }

    getFlatMemberById(id: number): Observable<ApiResponse<FlatMember>> {
        return this.httpClient.get<ApiResponse<FlatMember>>(`${this.url}/${id}`)
    }

    addOwnerToFlat(flatId : number , userId:number): Observable<ApiResponse<FlatMember>> {
        return this.httpClient.get<ApiResponse<FlatMember>>(`${this.url}/add-owner/${flatId}/${userId}`)
    }

    addMemberToFlat(flatMemberAddRequest: FlatMemberAddRequest): Observable<ApiResponse<FlatMember>> {
        return this.httpClient.post<ApiResponse<FlatMember>>(`${this.url}`, flatMemberAddRequest)
    }

    removeMemberFromFlat(id: number): Observable<ApiResponse<FlatMember>> {
        return this.httpClient.delete<ApiResponse<FlatMember>>(`${this.url}/${id}`)
    }

    updateMemberType( id : number,type : FlatMembershipType) : Observable<ApiResponse<FlatMember>> {
        return this.httpClient.put<ApiResponse<FlatMember>>(`${this.url}/${id}`,type)
    }

}