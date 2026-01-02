
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse, Action, Flat, FlatCreationRequest, FlatFilter, Page, Tenant, TenantCategoryPricing, TenantCategoryPricingResponse, TenantCategoryPricingRequest } from '../../types/types';

@Injectable({
    providedIn: 'root'
})

export class TenantCategoryPricingService {

    private url = `${environment.apiUrl}/category-pricing`;

    constructor(private httpClient: HttpClient) { }


    getTenantCategoryPricing():Observable<ApiResponse<TenantCategoryPricingResponse[]>> {
        return this.httpClient.get<ApiResponse<TenantCategoryPricingResponse[]>>(`${this.url}`)
    }

    updateCategoryPricing(tenantCategoryPricingRequest : TenantCategoryPricingRequest):Observable<ApiResponse<TenantCategoryPricing>>{
        return this.httpClient.post<ApiResponse<TenantCategoryPricing>>(`${this.url}`,tenantCategoryPricingRequest);
    }

     updatePenaltyFee(tenantCategoryPricingRequest : TenantCategoryPricingRequest):Observable<ApiResponse<TenantCategoryPricing>>{
        return this.httpClient.post<ApiResponse<TenantCategoryPricing>>(`${this.url}/penalty`,tenantCategoryPricingRequest);
    }


}