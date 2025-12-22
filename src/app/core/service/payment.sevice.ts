// src/app/core/service/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { 
  ApiResponse, 
  Payment, 
  PaymentCalculationDTO, 
  PaymentRequestDTO, 
  PaymentResponseDTO, 
  PaymentVerificationDTO, 
  RazorpayOrderDTO,
  Page,
  PaymentFilter
} from '../../types/types';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/maintenance-payments`;

  constructor(private http: HttpClient) { }

  

  // Calculate payment amount
  calculatePayment(flatId: number, billingCycle: string): Observable<ApiResponse<PaymentCalculationDTO>> {
    return this.http.get<ApiResponse<PaymentCalculationDTO>>(
      `${this.apiUrl}/calculate?flatId=${flatId}&billingCycle=${billingCycle}`
    );
  }

  // Initiate payment
  initiatePayment(paymentRequest: PaymentRequestDTO): Observable<ApiResponse<RazorpayOrderDTO>> {
    return this.http.post<ApiResponse<RazorpayOrderDTO>>(
      `${this.apiUrl}/initiate`,
      paymentRequest
    );
  }

  // Verify payment
  verifyPayment(verificationData: PaymentVerificationDTO): Observable<ApiResponse<PaymentResponseDTO>> {
    return this.http.post<ApiResponse<PaymentResponseDTO>>(
      `${this.apiUrl}/verify`,
      verificationData
    );
  }

  // Check if flat has active payment
  checkActivePayment(flatId: number): Observable<ApiResponse<Boolean>> {
    const today = new Date().toISOString().substring(0, 10);
    return this.http.post<ApiResponse<Boolean>>(
      `${this.apiUrl}/active-payment/${flatId}`, 
      `"${today}"`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
    // Check if flat has active payment
  getActivePayment(flatId: number): Observable<ApiResponse<PaymentResponseDTO>> {
    const today = new Date().toISOString().substring(0, 10);
    return this.http.post<ApiResponse<PaymentResponseDTO>>(
      `${this.apiUrl}/get/active-payment/${flatId}`, 
      `"${today}"`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }


  // Report payment failure
  reportFailure(paymentId: number, razorpayPaymentId: string, reason: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/report-failure?paymentId=${paymentId}&razorpayPaymentId=${razorpayPaymentId}&reason=${encodeURIComponent(reason)}`,
      {}
    );
  }

  // Get my payments (paginated)
  getMyPaymentsPaginated(    filter: PaymentFilter, pageNumber: number = 0, pageSize: number = 6): Observable<Page<Payment>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.post<Page<Payment>>(
      `${this.apiUrl}/my-payments`,
      filter,
      { params }
    );
  }

  // Search payments with filters (paginated) - Admin
  searchPaymentsPaginated(
    filter: PaymentFilter, 
    pageNumber: number = 0, 
    pageSize: number = 10
  ): Observable<Page<Payment>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.post<Page<Payment>>(
      `${this.apiUrl}/search`,
      filter,
      { params }
    );
  }

  // Get payments by flat
  getPaymentsByFlat(flatId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(
      `${this.apiUrl}/flat/${flatId}`
    );
  }

  // Get active payment for flat
  getActivePaymentForFlat(flatId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(
      `${this.apiUrl}/flat/${flatId}/active`
    );
  }

  // Open Razorpay checkout
  openRazorpayCheckout(
    orderData: RazorpayOrderDTO,
    onSuccess: (response: any) => void,
    onFailure: (response: any) => void,
    onDismiss: () => void
  ): void {
    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: 'Society Management',
      description: 'Maintenance Payment',
      order_id: orderData.orderId,
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerContact
      },
      theme: {
        color: '#667eea'
      },
      handler: (response: any) => {
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          onDismiss();
        }
      }
    };

    const razorpay = new Razorpay(options);

    razorpay.on('payment.failed', (response: any) => {
      onFailure(response);
    });

    razorpay.open();
  }
}