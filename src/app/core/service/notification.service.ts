import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notice, NoticeCreationRequest, NoticeFilter, Notification, Page } from '../../types/types';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notification`;
    constructor (private httpClient : HttpClient){}
  getUserNotification() : Observable<ApiResponse<Notification[]>> {
    return this.httpClient.get<ApiResponse<Notification[]>>(`${this.url}/user`)
  }

   getSocietyNotification() : Observable<ApiResponse<Notification[]>> {
    return this.httpClient.get<ApiResponse<Notification[]>>(`${this.url}/society`)
  }

  markAsRead(id:number) : Observable<ApiResponse<string>> {
    return this.httpClient.get<ApiResponse<string>>(`${this.url}/read/${id}`)
  }

}