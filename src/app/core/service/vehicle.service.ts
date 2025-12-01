import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Page, VehicleCreationRequest, VehicleFilter,Vehicle as Vehicles } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class Vehicle {
    private url = `${environment.apiUrl}/vehicle`;

  constructor(private httpClient: HttpClient) {}



    getVehicleById(id: number): Observable<ApiResponse<Vehicles>> {
      return this.httpClient.get<ApiResponse<Vehicles>>(`${this.url}/${id}`);
    }

    uploadVehicleImage(id:number,image:any) : Observable<ApiResponse<Vehicles>>{
         return this.httpClient.post<ApiResponse<Vehicles>>(`${this.url}/upload/${id}`,image);
    }

    registerVehicle(vehicleRequest : VehicleCreationRequest): Observable<ApiResponse<Vehicles>> {
      return this.httpClient.post<ApiResponse<Vehicles>>(`${this.url}`,vehicleRequest);
    }

      updateVehicle(id : number,vehicleRequest : VehicleCreationRequest): Observable<ApiResponse<Vehicles>> {
      return this.httpClient.put<ApiResponse<Vehicles>>(`${this.url}/${id}`,vehicleRequest);
    }

    deleteVehicle(id:number): Observable<ApiResponse<Vehicles>> {
      return this.httpClient.delete<ApiResponse<Vehicles>>(`${this.url}/${id}`);
    }
  searchVehicle(filter: VehicleFilter, pageNumber = 0, pageSize = 10): Observable<Page<Vehicles>> {
    return this.httpClient.post<Page<Vehicles>>(`${this.url}/search?pageNumber=${pageNumber}&pageSize=${pageSize}`, filter);
  }


}
