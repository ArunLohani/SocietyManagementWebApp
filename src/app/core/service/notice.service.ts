import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Notice, NoticeCreationRequest, NoticeFilter, Page } from '../../types/types';

@Injectable({ providedIn: 'root' })
export class NoticesService {
  private url = `${environment.apiUrl}/notices`;

  constructor(private httpClient: HttpClient) {}

  createNotice(request: NoticeCreationRequest): Observable<ApiResponse<Notice>> {
    return this.httpClient.post<ApiResponse<Notice>>(this.url, request);
  }

  deleteNotice(noticeId:number): Observable<ApiResponse<Notice>> {
    return this.httpClient.delete<ApiResponse<Notice>>(`${this.url}/${noticeId}`);
  }

  getNoticeById(noticeId: number): Observable<ApiResponse<Notice>> {
    return this.httpClient.get<ApiResponse<Notice>>(`${this.url}/${noticeId}`);
  }

  updateNotice(noticeId: number, request: NoticeCreationRequest): Observable<ApiResponse<Notice>> {
    return this.httpClient.put<ApiResponse<Notice>>(`${this.url}/${noticeId}`, request);
  }

  togglePublic(noticeId: number): Observable<ApiResponse<Notice>> {
    return this.httpClient.patch<ApiResponse<Notice>>(`${this.url}/${noticeId}/toggle-public`, {});
  }

  toggleExpired(noticeId: number): Observable<ApiResponse<Notice>> {
    return this.httpClient.patch<ApiResponse<Notice>>(`${this.url}/${noticeId}/toggle-expired`, {});
  }

  getNoticesForTenant(tenantId: number, pageNumber = 0, pageSize = 10): Observable<ApiResponse<Page<Notice>>> {
    return this.httpClient.get<ApiResponse<Page<Notice>>>(`${this.url}/tenant/${tenantId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  searchNotices(filter: NoticeFilter, pageNumber = 0, pageSize = 10): Observable<ApiResponse<Page<Notice>>> {
    return this.httpClient.post<ApiResponse<Page<Notice>>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }
}