// src/app/features/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../core/service/payment.sevice';
import { FlatService } from '../../core/service/flat.service';
import { AuthService } from '../../core/service/auth.service';
import { 
  PaymentCalculationDTO, 
  PaymentRequestDTO, 
  RazorpayOrderDTO,
  Flat
} from '../../types/types';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    SelectModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit {
  flatId: number | null = null;
  billingCycle: string = '';
  
  billingCycles = [
    { label: 'Monthly (1 month)', value: 'MONTHLY', duration: '1 month' },
    { label: 'Quarterly (3 months)', value: 'QUARTERLY', duration: '3 months' },
    { label: 'Half Yearly (6 months)', value: 'SEMI_ANNUAL', duration: '6 months' },
    { label: 'Yearly (12 months)', value: 'ANNUAL', duration: '12 months' },
    { label: 'Biennially (24 months)', value: 'BIENNIAL', duration: '24 months' }
  ];

  userFlats: Flat[] = [];
  loadingFlats = false;
  selectedFlat: Flat | null = null;

  calculatedAmount: PaymentCalculationDTO | null = null;
  orderData: RazorpayOrderDTO | null = null;
  
  // Active payment tracking
  hasActivePayment = false;
  activePaymentInfo: any = null;
  checkingActivePayment = false;
  
  loading = false;
  calculating = false;
  message = '';
  messageType: 'success' | 'error' | 'info' | '' = '';
  showAmountPreview = false;

  constructor(
    private paymentService: PaymentService,
    private flatService: FlatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Check for pre-selected flat from query params
    this.route.queryParams.subscribe(params => {
      if (params['flatId']) {
        this.flatId = +params['flatId'];
      }
    });

    this.loadUserFlats();
  }

  loadUserFlats() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loadingFlats = true;
    this.flatService.searchFlatList({ member: userId }).subscribe({
      next: (res) => {
        this.userFlats = res.data || [];
        this.loadingFlats = false;

        // If flatId was pre-selected, find and set it
        if (this.flatId) {
          this.selectedFlat = this.userFlats.find(f => f.id === this.flatId) || null;
          if (this.selectedFlat) {
            this.checkActivePaymentStatus();
          }
        }
      },
      error: (err) => {
        this.loadingFlats = false;
        this.toastr.error('Failed to load your flats', 'Error');
      }
    });
  }

  onFlatChange() {
    if (this.flatId) {
      this.selectedFlat = this.userFlats.find(f => f.id === this.flatId) || null;
      this.calculatedAmount = null;
      this.showAmountPreview = false;
      this.hasActivePayment = false;
      this.activePaymentInfo = null;
      
      // Check for active payment when flat is selected
      this.checkActivePaymentStatus();
    }
  }

  checkActivePaymentStatus() {
    if (!this.flatId) return;

    this.checkingActivePayment = true;
    
    this.paymentService.getActivePayment(this.flatId)
      .subscribe({
        next: (response) => {
          this.checkingActivePayment = false;
          
          if (response.success && response.data) {
            this.hasActivePayment = true;
            this.activePaymentInfo = response.data;
            
            this.toastr.info(
              `You have an active payment for this month.`,
              'Active Payment Found',
              { timeOut: 5000 }
            );
          } else {
            this.hasActivePayment = false;
            this.activePaymentInfo = null;
          }
        },
        error: (err) => {
          this.checkingActivePayment = false;
          console.error('Error checking active payment:', err);
          // Don't show error toast for this check - just log it
        }
      });
  }

  onBillingCycleChange(): void {
    if (this.flatId && this.billingCycle) {
      this.calculatePayment();
    }
  }

  calculatePayment(): void {
    if (!this.flatId || !this.billingCycle) {
      this.toastr.warning('Please select flat and billing cycle', 'Validation Error');
      return;
    }

    if (this.hasActivePayment) {
      this.toastr.warning(
        'You already have an active payment for this period',
        'Cannot Calculate'
      );
      return;
    }

    this.calculating = true;
    this.showMessage('Calculating payment...', 'info');

    this.paymentService.calculatePayment(this.flatId, this.billingCycle)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.calculatedAmount = response.data;
            this.showAmountPreview = true;
            this.clearMessage();
          } else {
            this.showMessage(response.message, 'error');
            this.toastr.error(response.message, 'Calculation Failed');
          }
          this.calculating = false;
        },
        error: (error) => {
          console.error('Calculation error:', error);
          
          // Check if error is about duplicate payment
          const errorMsg = error.error?.message || error.message || 'Failed to calculate payment';
          
          if (errorMsg.includes('already have an active payment')) {
            this.toastr.error(errorMsg, 'Duplicate Payment Detected', { timeOut: 7000 });
            this.showMessage(errorMsg, 'error');
            
            // Refresh active payment status
            this.checkActivePaymentStatus();
          } else {
            this.toastr.error('Failed to calculate payment amount', 'Error');
            this.showMessage(errorMsg, 'error');
          }
          
          this.calculating = false;
        }
      });
  }

  initiatePayment(): void {
    if (!this.flatId || !this.billingCycle) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    if (this.hasActivePayment) {
      this.toastr.error(
        'You already have an active payment. Please wait until it expires.',
        'Cannot Process Payment'
      );
      return;
    }

    if (!this.calculatedAmount) {
      this.calculatePayment();
      return;
    }

    this.loading = true;
    this.showMessage('Initiating payment...', 'info');

    const paymentRequest: PaymentRequestDTO = {
      flatId: this.flatId,
      billingCycle: this.billingCycle,
    };

    this.paymentService.initiatePayment(paymentRequest)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.orderData = response.data;
            this.showMessage('Opening Razorpay checkout...', 'info');
            this.openRazorpayCheckout();
          } else {
            this.showMessage(response.message, 'error');
            this.toastr.error(response.message, 'Payment Initiation Failed');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Payment initiation error:', error);
          
          const errorMsg = error.error?.message || error.message || 'Failed to initiate payment';
          
          if (errorMsg.includes('already have an active payment')) {
            this.toastr.error(errorMsg, 'Duplicate Payment Detected', { timeOut: 7000 });
            this.showMessage(errorMsg, 'error');
            
            // Refresh active payment status
            this.checkActivePaymentStatus();
          } else {
            this.toastr.error(errorMsg, 'Error');
            this.showMessage(errorMsg, 'error');
          }
          
          this.loading = false;
        }
      });
  }

  openRazorpayCheckout(): void {
    if (!this.orderData) return;

    this.paymentService.openRazorpayCheckout(
      this.orderData,
      (response) => this.onPaymentSuccess(response),
      (response) => this.onPaymentFailure(response),
      () => this.onPaymentDismiss()
    );
  }

  onPaymentSuccess(razorpayResponse: any): void {
    this.showMessage('Verifying payment...', 'info');
    console.log("RAZORPAY RESPONSE", razorpayResponse);

    const verificationData = {
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    };

    this.paymentService.verifyPayment(verificationData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.toastr.success(
              'Payment successful! Your maintenance has been paid.',
              'Success',
              { timeOut: 5000 }
            );
            this.showMessage('✓ Payment successful!', 'success');
            this.resetForm();
            
            // Refresh active payment status after successful payment
            setTimeout(() => {
              this.checkActivePaymentStatus();
            }, 1000);
          } else {
            this.toastr.error('Payment verification failed: ' + response.message, 'Error');
            this.showMessage('Payment verification failed', 'error');
          }
        },
        error: (error) => {
          console.error('Verification error:', error);
          this.toastr.error(
            'Payment verification failed. Please contact support.',
            'Error',
            { timeOut: 7000 }
          );
          this.loading = false;
        }
      });
  }

  onPaymentFailure(response: any): void {
    console.error('Payment failed:', response);
    
    const errorDescription = response.error?.description || 'Payment failed';
    const razorpayPaymentId = response.error?.metadata?.payment_id || '';

    this.toastr.error(`Payment failed: ${errorDescription}`, 'Payment Failed', { timeOut: 7000 });

    if (this.orderData && razorpayPaymentId) {
      this.paymentService.reportFailure(
        this.orderData.paymentId,
        razorpayPaymentId,
        errorDescription
      ).subscribe({
        next: () => console.log('Failure reported'),
        error: (err) => console.error('Error reporting failure:', err)
      });
    }

    this.loading = false;
  }

  onPaymentDismiss(): void {
    this.toastr.warning('Payment cancelled by user', 'Cancelled');
    this.loading = false;
  }

  showMessage(text: string, type: 'success' | 'error' | 'info'): void {
    this.message = text;
    this.messageType = type;

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }

  clearMessage(): void {
    this.message = '';
    this.messageType = '';
  }

  resetForm(): void {
    this.billingCycle = '';
    this.calculatedAmount = null;
    this.showAmountPreview = false;
    this.orderData = null;
  }

  getSelectedCycleName(): string {
    const cycle = this.billingCycles.find(c => c.value === this.billingCycle);
    return cycle ? cycle.label : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/menu/dashboard']);
  }
}