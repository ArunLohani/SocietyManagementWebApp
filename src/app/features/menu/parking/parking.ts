// src/app/features/parking/parking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastrService } from 'ngx-toastr';
import { ParkingSlotService } from '../../../core/service/parking-slot.service';
import { 
  ParkingSlot, 
  ParkingSlotFilter, 
  ParkingSlotRegisterRequest, 
  ParkingSlotStatus, 
  Page 
} from '../../../types/types';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    PaginatorModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    SelectModule,
    FloatLabel,
    BadgeModule,
    DialogModule,
    ProgressSpinnerModule
  ],
  templateUrl: './parking.html',
  styleUrls: ['./parking.css']
})
export class Parking implements OnInit {
  parkingSlotsPage: Page<ParkingSlot> | null = null;
  loading = false;

  // Filters
  filter: ParkingSlotFilter = {};
  page = 0;
  pageSize = 8;

  // Modal states
  showSlotModal = false;
  isEditMode = false;
  editingSlotId: number | null = null;
  slotForm: ParkingSlotRegisterRequest = this.getEmptySlotForm();

  // Delete modal
  showDeleteModal = false;
  deletingSlotId: number | null = null;

  // Status update modal
  showStatusModal = false;
  updatingSlotId: number | null = null;
  selectedStatus: string = "AVAILABLE";

  // Status options for select
  statusOptions = [
    { name: 'All Status', code: '' },
    { name: 'Available', code: 'AVAILABLE' },
    { name: 'Occupied', code: 'OCCUPIED' },
    { name: 'Reserved', code: 'RESERVED' },
    { name: 'Out of Service', code: 'OUT_OF_SERVICE' }
  ];

  statusUpdateOptions = [
    { name: 'Available', code: 'AVAILABLE' },
    // { name: 'Occupied', code: 'OCCUPIED' },
    { name: 'Reserved', code: "RESERVED" },
    { name: 'Out of Service', code: "OUT_OF_SERVICE" }
  ];

    // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private parkingSlotService: ParkingSlotService,
    private router: Router,
    private toastr: ToastrService,
    private tenantRoleMenuService : TenantRoleMenuService
    ) { this.tenantRoleMenuService.getPriority("Parking").subscribe({
        next: (res) => {
          console.log(res)
          this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
        },
        error: (err) => {
          this.permission = "READ";
        },
      });}

  ngOnInit(): void {
    this.loadParkingSlots(0);
  }

  getEmptySlotForm(): ParkingSlotRegisterRequest {
    return {
      slotNumber: '',
      area: ''
    };
  }

  loadParkingSlots(page: number = 0) {
    this.loading = true;
    this.parkingSlotService.searchParkingSlots(this.filter, page, this.pageSize).subscribe({
      next: (res) => {
        this.parkingSlotsPage = res;
        this.page = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load parking slots', 'Error');
      }
    });
  }

  onPageChange(e: PaginatorState) {
    this.loadParkingSlots(e.page);
  }

  applyFilters() {
    
    this.loadParkingSlots(0);
  }

  clearFilters() {
    this.filter = {};
    this.loadParkingSlots(0);
  }

  // Slot Modal Operations
  openCreateModal() {
    this.isEditMode = false;
    this.editingSlotId = null;
    this.slotForm = this.getEmptySlotForm();
    this.showSlotModal = true;
  }

  openEditModal(slot: ParkingSlot) {
    this.isEditMode = true;
    this.editingSlotId = slot.id ? slot.id : null;
    this.slotForm = {
      slotNumber: slot.slotNumber,
      area: slot.area
    };
    this.showSlotModal = true;
  }

  closeSlotModal() {
    this.showSlotModal = false;
    this.isEditMode = false;
    this.editingSlotId = null;
    this.slotForm = this.getEmptySlotForm();
  }

  saveSlot() {
    if (!this.slotForm.slotNumber) {
      this.toastr.warning('Please provide a slot number', 'Warning');
      return;
    }

    const operation = this.isEditMode && this.editingSlotId
      ? this.parkingSlotService.updateParkingSlot(this.editingSlotId, this.slotForm)
      : this.parkingSlotService.registerParkingSlot(this.slotForm);

    operation.subscribe({
      next: () => {
        this.toastr.success(
          `Slot ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Success'
        );
        this.closeSlotModal();
        this.loadParkingSlots(this.page);
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} slot`,
          'Error'
        );
      }
    });
  }

  // Delete Operations
  openDeleteModal(slotId: number) {
    this.deletingSlotId = slotId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingSlotId = null;
  }

  confirmDelete() {
    if (!this.deletingSlotId) return;

    this.parkingSlotService.deleteParkingSlot(this.deletingSlotId).subscribe({
      next: () => {
        this.toastr.success('Slot deleted successfully', 'Success');
        this.closeDeleteModal();
        this.loadParkingSlots(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to delete slot', 'Error');
      }
    });
  }

  // Status Operations
  openStatusModal(slotId: number) {
    this.updatingSlotId = slotId;
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.updatingSlotId = null;
  }

  updateStatus() {
    if (!this.updatingSlotId) return;
    console.log("this.updatingSlotId, this.selectedStatus",this.updatingSlotId, this.selectedStatus)
    this.parkingSlotService.updateSlotStatus(this.updatingSlotId, this.selectedStatus).subscribe({
      next: () => {
        this.toastr.success('Status updated successfully', 'Success');
        this.closeStatusModal();
        this.loadParkingSlots(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update status', 'Error');
      }
    });
  }

  reserveSlot(slotId: number) {
    this.parkingSlotService.reserveParkingSlot(slotId).subscribe({
      next: () => {
        this.toastr.success('Slot reserved successfully', 'Success');
        this.loadParkingSlots(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to reserve slot', 'Error');
      }
    });
  }

  freeSlot(slotId: number) {
    this.parkingSlotService.freeParkingSlot(slotId).subscribe({
      next: () => {
        this.toastr.success('Slot freed successfully', 'Success');
        this.loadParkingSlots(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to free slot', 'Error');
      }
    });
  }

  getStatusLabel(status: ParkingSlotStatus): string {
    const labels: any = {
      'AVAILABLE': 'Available',
      'OCCUPIED': 'Occupied',
      'RESERVED': 'Reserved',
      'OUT_OF_SERVICE': 'Out of Service'
    };
    
    return labels[status.toString()] || status.toString();
  }

getStatusSeverity(
  status: ParkingSlotStatus
): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {

  const severities: Record<number,
    "info" | "success" | "warn" | "danger" | "secondary" | "contrast"
  > = {
    [ParkingSlotStatus.AVAILABLE]: "success",
    [ParkingSlotStatus.OCCUPIED]: "danger",
    [ParkingSlotStatus.RESERVED]: "warn",
    [ParkingSlotStatus.OUT_OF_SERVICE]: "secondary"
  };
 const enumValue =
    typeof status === "string"
      ? ParkingSlotStatus[status as keyof typeof ParkingSlotStatus]
      : status;
  return severities[enumValue] ?? "contrast";
}


}