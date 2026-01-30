
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, GuestRequestDTO, Page, VehicleCreationRequest, VehicleFilter,Vehicle as Vehicles, VisitorRequestFilter, VisitorResponseDTO } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class Visitor {
    private url = `${environment.apiUrl}/visitor-requests`;

  constructor(private httpClient: HttpClient) {}

     getVisitorRequestById(id: number): Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.get<ApiResponse<VisitorResponseDTO>>(`${this.url}/${id}`);
    }

    searchVisitorRequests(filter:VisitorRequestFilter) : Observable<ApiResponse<VisitorResponseDTO[]>>{
        return this.httpClient.post<ApiResponse<VisitorResponseDTO[]>>(`${this.url}/search`,filter)
    }

    searchVisitorRequestsPaginated(filter : VisitorRequestFilter , pageNumber : number = 0,pageSize:number = 10){
         return this.httpClient.post<ApiResponse<VisitorResponseDTO[]>>(`${this.url}/search-paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`,filter)
    }

    getCurrentVisitors():Observable<ApiResponse<VisitorResponseDTO[]>>{
         return this.httpClient.get<ApiResponse<VisitorResponseDTO[]>>(`${this.url}/current`);
    }

    createVisitorRequestByResident(visitorRequest : GuestRequestDTO) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.post<ApiResponse<VisitorResponseDTO>>(`${this.url}/resident/create`,visitorRequest);
    }

     updateVisitorRequest(id:number,visitorRequest : GuestRequestDTO) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.put<ApiResponse<VisitorResponseDTO>>(`${this.url}/${id}`,visitorRequest);
    }

      cancelVisitorRequest(id:number) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.delete<ApiResponse<VisitorResponseDTO>>(`${this.url}/${id}`);
    }

          approveVisitorRequest(id:number) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.post<ApiResponse<VisitorResponseDTO>>(`${this.url}/${id}/approve`,{});
    }

           rejectVisitorRequest(id:number) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.post<ApiResponse<VisitorResponseDTO>>(`${this.url}/${id}/reject`,{});
    }

    
    createVisitorRequestByGuard(visitorRequest : GuestRequestDTO) : Observable<ApiResponse<VisitorResponseDTO>> {
      return this.httpClient.post<ApiResponse<VisitorResponseDTO>>(`${this.url}/guard/walk-in"`,visitorRequest);
    }

    verifyOtpAndMarkEntry(
    visitorRequestId: number,
    otp: string
  ): Observable<ApiResponse<VisitorResponseDTO>> {

    const url = `${this.url}/${visitorRequestId}/verify-entry`;

    return this.httpClient.post<ApiResponse<VisitorResponseDTO>>(url, {
      otp: otp
    });
  }

  

}