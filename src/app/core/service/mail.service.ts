import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class MailService {
   private url = `${environment.apiUrl}/mail`;
  
    constructor(private httpClient: HttpClient) {}
  
    sendPendingMaintenanceReminder(flatId : number) : Observable<ApiResponse<string>> {
      return this.httpClient.get<ApiResponse<string>>(`${this.url}/maintenance/pending/${flatId}`)
    }

     sendSocietyNotice(flatId : number,message:string) : Observable<ApiResponse<string>> {
      return this.httpClient.post<ApiResponse<string>>(`${this.url}/notice/${flatId}`,message)
    }

         sendEmergencyAlert(flatId : number,emergencyMessage:string) : Observable<ApiResponse<string>> {
      return this.httpClient.post<ApiResponse<string>>(`${this.url}/emergency/${flatId}`,emergencyMessage)
    }

  
}
