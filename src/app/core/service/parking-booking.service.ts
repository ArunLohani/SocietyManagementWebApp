import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Page, ParkingBookingRequest, ParkingRequest, ParkingRequestFilter } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class ParkingBookingService {

    private url = `${environment.apiUrl}/parking-booking`;

  constructor(private httpClient: HttpClient) { }

  findParkingRequestById(id: number): Observable<ApiResponse<ParkingRequest>> {
    return this.httpClient.get<ApiResponse<ParkingRequest>>(`${this.url}/${id}`);
  }


  requestParkingSlot(parkingSlotId: number,flatId : string): Observable<ApiResponse<ParkingRequest>> {
    return this.httpClient.post<ApiResponse<ParkingRequest>>(`${this.url}/${flatId}`, parkingSlotId);
  }

  deleteParkingRequest(parkingRequestId : number) : Observable<ApiResponse<ParkingRequest>>{
    return this.httpClient.delete<ApiResponse<ParkingRequest>>(`${this.url}/${parkingRequestId}`);
  }

  acceptParkingSlotRequest(id: number): Observable<ApiResponse<ParkingRequest>> {
    return this.httpClient.get<ApiResponse<ParkingRequest>>(`${this.url}/accept/${id}`);
  }
    rejectParkingSlotRequest(id: number): Observable<ApiResponse<ParkingRequest>> {
    return this.httpClient.get<ApiResponse<ParkingRequest>>(`${this.url}/reject/${id}`);
  }

  searchParkingRequest(filter: ParkingRequestFilter, pageNumber = 0, pageSize = 10): Observable<Page<ParkingRequest>> {
    return this.httpClient.post<Page<ParkingRequest>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }

  
}
