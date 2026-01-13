import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CurrentImpersonationDto, ImpersonationSessionFilter, Page, StartImpersonationResponseDto , ImpersonationSession as ImpersonationSessionType } from '../../types/types';

@Injectable({
  providedIn: 'root',
})
export class ImpersonationSessionService {
  url = `${environment.apiUrl}/impersonation`;

  constructor(private httpClient: HttpClient) {``
  }

  startImpersonation(ticketId: number): Observable<ApiResponse<StartImpersonationResponseDto>> {
    return this.httpClient.post<ApiResponse<StartImpersonationResponseDto>>(`${this.url}/start/${ticketId}`, {})
  }

  endImpersonation(sessionId: number): Observable<ApiResponse<String>> {
    return this.httpClient.post<ApiResponse<String>>(`${this.url}/end/${sessionId}`, {})
  }

  getCurrentImpersonationSession(): Observable<ApiResponse<CurrentImpersonationDto>> {
    return this.httpClient.get<ApiResponse<CurrentImpersonationDto>>(`${this.url}/current`)
  }

  getSessionById(sessionId: number): Observable<ApiResponse<ImpersonationSessionType>> {
    return this.httpClient.get<ApiResponse<ImpersonationSessionType>>(`${this.url}/sessions/${sessionId}`)
  }

  getSessions(filter: ImpersonationSessionFilter): Observable<ApiResponse<ImpersonationSessionType[]>> {
    return this.httpClient.post<ApiResponse<ImpersonationSessionType[]>>(`${this.url}/sessions`, filter)
  }

  getSessionsPaginated(filter: ImpersonationSessionFilter, pageNumber: number = 0, pageSize: number = 8): Observable<Page<ImpersonationSessionType>> {

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
    return this.httpClient.post<Page<ImpersonationSessionType>>(`${this.url}/sessions/paginated`, filter, { params });
  }

  getActiveSessionsForTicket(ticketId: number): Observable<ApiResponse<ImpersonationSessionType[]>> {
    return this.httpClient.get<ApiResponse<ImpersonationSessionType[]>>(`${this.url}/sessions/ticket/${ticketId}/active`);}

    checkSessionActive(sessionId: number): Observable<ApiResponse<Boolean>> {
    return this.httpClient.get<ApiResponse<Boolean>>(`${this.url}/sessions/${sessionId}/active`);}

}
