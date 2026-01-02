

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Event, EventCreationRequest, EventResponse, EventFilter, Page, User } from '../../types/types';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private url = `${environment.apiUrl}/events`;

  constructor(private httpClient: HttpClient) {}

  createEvent(request: EventCreationRequest): Observable<ApiResponse<EventResponse>> {
    return this.httpClient.post<ApiResponse<EventResponse>>(this.url, request);
  }

  updateEvent(id : number , request : EventCreationRequest):Observable<ApiResponse<EventResponse>> {
    console.log("id",id)
    return this.httpClient.put<ApiResponse<EventResponse>>(`${this.url}/${id}`, request);}

    deleteEvent (id : number):Observable<ApiResponse<String>> {
    return this.httpClient.delete<ApiResponse<String>>(`${this.url}/${id}`);}

  getEventById(eventId: number): Observable<ApiResponse<Event>> {
    return this.httpClient.get<ApiResponse<Event>>(`${this.url}/${eventId}`);
  }

  getEventsForTenant(tenantId: number, pageNumber = 0, pageSize = 6): Observable<ApiResponse<Page<Event>>> {
    return this.httpClient.get<ApiResponse<Page<Event>>>(`${this.url}/tenant/${tenantId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

    getEventsForMyTenant(pageNumber = 0, pageSize = 6): Observable<ApiResponse<Page<Event>>> {
    return this.httpClient.get<ApiResponse<Page<Event>>>(`${this.url}/tenant/me?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }


  searchEvents(filter: EventFilter, pageNumber = 0, pageSize = 6): Observable<ApiResponse<Page<Event>>> {
    return this.httpClient.post<ApiResponse<Page<Event>>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }

  addParticipant(eventId: number, userId: number): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.url}/${eventId}/participants/${userId}`, {});
  }

  removeParticipant(eventId: number, userId: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(`${this.url}/${eventId}/participants/${userId}`);
  }

  takeParticipation(eventId: number): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.url}/${eventId}/participate`, {});
  }

  removeParticipation(eventId: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(`${this.url}/${eventId}/participate`);
  }

  getAllParticipants(eventId: number): Observable<ApiResponse<User[]>> {
    return this.httpClient.get<ApiResponse<User[]>>(`${this.url}/${eventId}/participants`);
  }

  getAllEventsForUser(userId: number): Observable<ApiResponse<Set<Event>>> {
    return this.httpClient.get<ApiResponse<Set<Event>>>(`${this.url}/user/${userId}`);
  }

  isUserParticipant(userId: number, eventId: number): Observable<ApiResponse<boolean>> {
    return this.httpClient.get<ApiResponse<boolean>>(`${this.url}/user/${userId}/${eventId}/participation`);
  }
}