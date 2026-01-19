
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../../core/service/payment.sevice';
import { FlatService } from '../../../core/service/flat.service';
import { AuthService } from '../../../core/service/auth.service';
import {
  Payment,
  PaymentFilter,
  Flat
} from '../../../types/types';

interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    DividerModule,
    SelectModule,
    DialogModule,
    ProgressSpinnerModule,
    TabsModule,
    InputTextModule,
    PaginatorModule
  ],
  templateUrl: './my-payments.html',
  styleUrls: ['./my-payments.css']
})
export class PaymentComponent implements OnInit {
  // Data
  payments: Payment[] = [];
  allPayments: Payment[] = [];
  userFlats: Flat[] = [];
  loading = false;
  adminLoading = false;
  activeTab = 0;
  isAdmin = false;

  // Pagination - My Payments
  myPaymentPageSize = 10;
  myPaymentPageNumber = 0;
  myPaymentTotalRecords = 0;

  // Pagination - Admin Payments
  adminPaymentPageSize = 10;
  adminPaymentPageNumber = 0;
  adminPaymentTotalRecords = 0;

  // Filters - My Payments
  myPaymentFilter: PaymentFilter = {};

  // Filters - Admin Payments
  adminPaymentFilter: PaymentFilter = {};
 
  // Dropdown options
  flatOptions: SelectOption[] = [];
  statusOptions: SelectOption[] = [
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Refunded', value: 'REFUNDED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  billingCycleFilterOptions: SelectOption[] = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Half-Yearly', value: 'HALF_YEARLY' },
    { label: 'Yearly', value: 'YEARLY' }
  ];

paymentMethodFilterOptions: SelectOption[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Credit / Debit Card', value: 'card' },
  { label: 'Net Banking', value: 'netbanking' },
  { label: 'Wallet', value: 'wallet' },
  // { label: 'EMI', value: 'EMI' },
  // { label: 'Pay Later', value: 'pay later' },
  // { label: 'Cardless EMI', value: 'CARDLESS_EMI' }
];


  constructor(
    private paymentService: PaymentService,
    private flatService: FlatService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isAdmin = this.authService.isUserAdmin();
  }

  ngOnInit(): void {
    this.loadMyPayments();
    if (this.isAdmin) {
      this.loadAllFlats();
    }
  }
onTabChange(tabIndex: string | number | undefined) {
  if (typeof tabIndex !== 'number') {
    return;
  }

  this.activeTab = tabIndex;

  if (tabIndex === 1 && this.isAdmin && this.allPayments.length === 0) {
    this.loadAdminPayments();
  }
}


  // Load all flats for admin dropdown
  loadAllFlats() {
    this.flatService.searchFlatList({}).subscribe({
      next: (res) => {
        const flats = res.data || [];
        this.flatOptions = flats.map(flat => ({
          label: `Block ${flat.block} - ${flat.number}`,
          value: flat.id
        }));
      },
      error: (err) => {
        console.error('Failed to load flats', err);
      }
    });
  }

  // Load My Payments
  loadMyPayments() {
    this.loading = true;
    this.paymentService.getMyPaymentsPaginated(
      this.myPaymentFilter,
      this.myPaymentPageNumber, 
      this.myPaymentPageSize
    ).subscribe({
      next: (res) => {
        this.payments = res.content || [];
        this.myPaymentTotalRecords = res.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to load payment history', 'Error');
      }
    });
  }

  // Load My Payments - Page Change Handler
  onMyPaymentPageChange(event: PaginatorState) {
    this.myPaymentPageNumber = event.page || 0;
    this.myPaymentPageSize = event.rows || 10;
    this.loadMyPayments();
  }

  // Load Admin Payments
  loadAdminPayments() {
    this.adminLoading = true;
    this.paymentService.searchPaymentsPaginated(
      this.adminPaymentFilter,
      this.adminPaymentPageNumber,
      this.adminPaymentPageSize
    ).subscribe({
      next: (res) => {
        this.allPayments = res.content || [];
        this.adminPaymentTotalRecords = res.totalElements;
        this.adminLoading = false;
      },
      error: (err) => {
        this.adminLoading = false;
        this.toastr.error('Failed to load payments', 'Error');
      }
    });
  }

  // Load Admin Payments - Page Change Handler
  onAdminPaymentPageChange(event: PaginatorState) {
    this.adminPaymentPageNumber = event.page || 0;
    this.adminPaymentPageSize = event.rows || 10;
    this.loadAdminPayments();
  }

  // Filter handlers
  onMyPaymentFilterChange() {
    this.myPaymentPageNumber = 0;
    this.loadMyPayments();
  }

  onAdminPaymentFilterChange() {
    this.adminPaymentPageNumber = 0;
    this.loadAdminPayments();
  }

  resetMyPaymentFilters() {
    this.myPaymentFilter = {};
    this.myPaymentPageNumber = 0;
    this.loadMyPayments();
  }

  resetAdminPaymentFilters() {
    this.adminPaymentFilter = {};
    this.adminPaymentPageNumber = 0;
    if (this.isAdmin) {
      this.loadAdminPayments();
    }
  }


  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: any = {
      'COMPLETED': 'success',
      'PROCESSING': 'info',
      'FAILED': 'danger',
      'REFUNDED': 'warn',
      'CANCELLED': 'secondary'
    };
    return severities[status] || 'secondary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getFlatLabel(flat: Flat): string {
    return `Block ${flat.block} - ${flat.number}`;
  }

  downloadReceipt(payment: Payment) {
    this.toastr.info('Receipt download feature coming soon', 'Info');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}