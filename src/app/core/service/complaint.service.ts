import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Complaints, ComplaintIssuingRequest, ComplaintsFilter, Page } from '../../types/types';

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  private url = `${environment.apiUrl}/complaints`;

  constructor(private httpClient: HttpClient) {}

  issueComplaint(request: ComplaintIssuingRequest): Observable<ApiResponse<Complaints>> {
    return this.httpClient.post<ApiResponse<Complaints>>(this.url, request);
  }
   updateComplaint(id : number,request: ComplaintIssuingRequest): Observable<ApiResponse<Complaints>> {
    return this.httpClient.put<ApiResponse<Complaints>>(`${this.url}/${id}`, request);
  }
   deleteComplaint(id : number): Observable<ApiResponse<Complaints>> {
    return this.httpClient.delete<ApiResponse<Complaints>>(`${this.url}/${id}`);
  }

  getComplaintById(id: number): Observable<ApiResponse<Complaints>> {
    return this.httpClient.get<ApiResponse<Complaints>>(`${this.url}/${id}`);
  }

  assignComplaint(complaintId: number, userId: number): Observable<ApiResponse<Complaints>> {
    return this.httpClient.put<ApiResponse<Complaints>>(`${this.url}/${complaintId}/assign/${userId}`, {});
  }

  changeComplaintStatus(complaintId: number, status: string): Observable<ApiResponse<Complaints>> {
    return this.httpClient.patch<ApiResponse<Complaints>>(`${this.url}/${complaintId}/status`, {}, { params: { status } });
  }

  listComplaintsByUser(userId: number, pageNumber = 0, pageSize = 10): Observable<ApiResponse<Page<Complaints>>> {
    return this.httpClient.get<ApiResponse<Page<Complaints>>>(`${this.url}/raised-by/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  listComplaintsAssignedToUser(userId: number, pageNumber = 0, pageSize = 10): Observable<ApiResponse<Page<Complaints>>> {
    return this.httpClient.get<ApiResponse<Page<Complaints>>>(`${this.url}/assigned-to/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  searchComplaints(filter: ComplaintsFilter, pageNumber = 0, pageSize = 10): Observable<ApiResponse<Page<Complaints>>> {
    return this.httpClient.post<ApiResponse<Page<Complaints>>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }

  addResolutionNotes(complaintId: number, note: string): Observable<ApiResponse<Complaints>> {
    return this.httpClient.patch<ApiResponse<Complaints>>(`${this.url}/${complaintId}/resolution`, note);
  }
}