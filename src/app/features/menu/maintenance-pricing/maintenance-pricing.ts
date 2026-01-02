import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastrService } from 'ngx-toastr';
import { TenantCategoryPricingService } from '../../../core/service/tenantCategoryPricing.service';
import { TenantCategoryPricingResponse } from '../../../types/types';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';

@Component({
  selector: 'app-maintenance-pricing',
  templateUrl: './maintenance-pricing.html',
  styleUrls: ['./maintenance-pricing.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    FloatLabel,
    DividerModule,
    InputTextModule,
    DialogModule,
    ProgressSpinnerModule
  ]
})
export class MaintenancePricingComponent implements OnInit {
  pricingList: TenantCategoryPricingResponse[] = [];
  loading = false;
  isSaving = false;

  // Edit modal
  showEditModal = false;
  editingPricing: TenantCategoryPricingResponse | null = null;
  editForm = {
    category: '',
    amount: 0,
    type: 'MONTHLY' as 'MONTHLY' | 'PENALTY'
  };

  // Permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  categoryLabels: { [key: string]: string } = {
    'ONE_BHK': '1 BHK',
    'TWO_BHK': '2 BHK',
    'THREE_BHK': '3 BHK',
    'DUPLEX': 'Duplex',
    'STUDIO': 'Studio'
  };

  constructor(
    private pricingService: TenantCategoryPricingService,
    private toastr: ToastrService,
    private tenantRoleMenuService: TenantRoleMenuService
  ) {
    this.tenantRoleMenuService.getPriority("Maintenance Pricing").subscribe({
      next: (res) => {
        this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
      },
      error: (err) => {
        this.permission = "READ";
      }
    });
  }

  ngOnInit(): void {
    this.loadPricing();
  }

  loadPricing() {
    this.loading = true;
    this.pricingService.getTenantCategoryPricing().subscribe({
      next: (res) => {
        this.pricingList = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load pricing', 'Error');
      }
    });
  }

  get editModalTitle(): string {
    return this.editForm.type === 'MONTHLY' ? 'Edit Monthly Fee' : 'Edit Penalty Fee';
  }

  openEditModal(pricing: TenantCategoryPricingResponse, type: 'MONTHLY' | 'PENALTY') {
    this.editingPricing = pricing;
    this.editForm = {
      category: pricing.category,
      amount: type === 'MONTHLY' ? pricing.amount : pricing.penalty,
      type: type
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingPricing = null;
    this.editForm = {
      category: '',
      amount: 0,
      type: 'MONTHLY'
    };
  }

  savePricing() {
    if (!this.editForm.category || this.editForm.amount <= 0) {
      this.toastr.warning('Please enter a valid amount', 'Validation Error');
      return;
    }

    this.isSaving = true;

    const request = {
      category: this.editForm.category,
      amount: this.editForm.amount
    };

    const updateObservable = this.editForm.type === 'MONTHLY'
      ? this.pricingService.updateCategoryPricing(request)
      : this.pricingService.updatePenaltyFee(request);

    updateObservable.subscribe({
      next: () => {
        this.isSaving = false;
        const feeType = this.editForm.type === 'MONTHLY' ? 'Monthly fee' : 'Penalty fee';
        this.toastr.success(`${feeType} updated successfully`, 'Success');
        this.closeEditModal();
        this.loadPricing();
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error(
          err.error?.message || 'Failed to update pricing',
          'Error'
        );
      }
    });
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}