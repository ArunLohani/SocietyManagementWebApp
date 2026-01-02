import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Page, ParkingSlot, ParkingSlotFilter, ParkingSlotRegisterRequest, ParkingSlotStatus } from '../../types/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingSlotService {
  private url = `${environment.apiUrl}/parking-lot`;

  constructor(private httpClient: HttpClient) { }

  getParkingSlotById(id: number): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.get<ApiResponse<ParkingSlot>>(`${this.url}/${id}`);
  }

  registerParkingSlot(parkingSlotRegisterRequest: ParkingSlotRegisterRequest): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.post<ApiResponse<ParkingSlot>>(`${this.url}`, parkingSlotRegisterRequest);
  }

  updateParkingSlot(id: number, parkingSlotRegisterRequest: ParkingSlotRegisterRequest): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.put<ApiResponse<ParkingSlot>>(`${this.url}/${id}`, parkingSlotRegisterRequest);
  }

  deleteParkingSlot(id: number): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.delete<ApiResponse<ParkingSlot>>(`${this.url}/${id}`);
  }

  searchParkingSlots(filter: ParkingSlotFilter, pageNumber = 0, pageSize = 10): Observable<Page<ParkingSlot>> {
    return this.httpClient.post<Page<ParkingSlot>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }

  updateSlotStatus(id: number, status: string): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.put<ApiResponse<ParkingSlot>>(`${this.url}/${id}/status`, status);
  }

  reserveParkingSlot(id: number): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.get<ApiResponse<ParkingSlot>>(`${this.url}/reserve/${id}`);
  }
  freeParkingSlot(id: number): Observable<ApiResponse<ParkingSlot>> {
    return this.httpClient.get<ApiResponse<ParkingSlot>>(`${this.url}/free/${id}`);
  }

}
