import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Page, SupportTicketFilter, TicketRaiseRequest,SupportTicket as Ticket } from '../../types/types';

@Injectable({
  providedIn: 'root',
})
export class SupportTicket {

     url = `${environment.apiUrl}/support-tickets`;

  constructor(private httpClient: HttpClient) {
  }

   getTicketById(id: string): Observable<ApiResponse<Ticket>> {
      return this.httpClient.get<ApiResponse<Ticket>>(`${this.url}/${id}`);
    }

    raiseTicket(request : TicketRaiseRequest): Observable<ApiResponse<Ticket>> {
      return this.httpClient.post<ApiResponse<Ticket>>(`${this.url}`,request);
    }

    getTickets(filter : SupportTicketFilter) : Observable<ApiResponse<Ticket[]>> {
        return this.httpClient.post<ApiResponse<Ticket[]>>(`${this.url}/search`,filter);
    }

    getTicketsPaginated(filter:SupportTicketFilter,pageNumber : number = 0,pageSize : number=8) : Observable<Page<Ticket>> {

       let params = new HttpParams()
      .set('pageNumber',pageNumber)
      .set('pageSize',pageSize)
        return this.httpClient.post<Page<Ticket>>(`${this.url}/search/paginated`,filter,{params});
    }

    updateTicketStatus(ticketId : number,status : string) : Observable<ApiResponse<Ticket>> {
      console.log("updateTicketStatus",status)
       let params = new HttpParams()
      .set('status', status)
      return this.httpClient.patch<ApiResponse<Ticket>>(`${this.url}/${ticketId}/status`,null,{params})
    }

    updateImpersonationStatus(ticketId : number , allowImpersonation : boolean) :  Observable<ApiResponse<Ticket>> {
       let params = new HttpParams()
      .set('allowImpersonation', allowImpersonation)
      return this.httpClient.patch<ApiResponse<Ticket>>(`${this.url}/${ticketId}/impersonation`,null,{params})
    }
}
