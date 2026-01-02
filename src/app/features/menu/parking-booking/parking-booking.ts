// src/app/features/parking-booking/parking-booking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastrService } from 'ngx-toastr';
import { ParkingBookingService } from '../../../core/service/parking-booking.service';
import { ParkingSlotService } from '../../../core/service/parking-slot.service';
import { 
  ParkingRequest, 
  ParkingBookingRequest, 
  ParkingRequestFilter, 
  ParkingSlot,
  ParkingSlotFilter, 
  ParkingRequestStatus,
  ParkingSlotStatus,
  Flat
} from '../../../types/types';
import { AuthService } from '../../../core/service/auth.service';
import { FlatService } from '../../../core/service/flat.service';
import { MessageModule } from 'primeng/message';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';

@Component({
  selector: 'app-parking-booking',
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
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    MessageModule
  ],
  templateUrl: './parking-booking.html',
  styleUrls: ['./parking-booking.css']
})
export class ParkingBooking implements OnInit {
  requestsPage: ParkingRequest[] = [];
  loading = false;
  isAdmin = false;
  currentUserId : number | null = null;
  // Filters
  filter: ParkingRequestFilter = {};
  page = 0;
  pageSize = 2;
  totalElements = 0;

  // Status options
  statusOptions = [
    { name: 'All Statuses', code: '' },
    { name: 'Pending', code: 'PENDING' },
    { name: 'Approved', code: 'APPROVED' },
    { name: 'Rejected', code: 'REJECTED' }
  ];

  // Available slots for selection
  availableSlots: ParkingSlot[] = [];
  loadingSlots = false;
  selectedSlot: ParkingSlot | null = null;
  slotFilter: ParkingSlotFilter = { status: 'AVAILABLE' };

  slotStatusOptions = [
    { name: 'All Available', code: '' },
    { name: 'Available', code: 'AVAILABLE' },
    { name: 'Reserved', code: 'RESERVED' }
  ];

  // Create request modal
  showRequestModal = false;
  requestForm: ParkingBookingRequest = this.getEmptyRequestForm();

  // View details modal
  showDetailsModal = false;
  selectedRequest: ParkingRequest | null = null;
  showDeleteModal = false;
  // Action confirmation modals
  showAcceptModal = false;
  showRejectModal = false;
  actioningRequestId: number | null = null;

  ParkingRequestStatus = ParkingRequestStatus;

  loadingFlats : boolean = false
  userFlats : Flat[] = []

    // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private parkingBookingService: ParkingBookingService,
    private parkingSlotService: ParkingSlotService,
    private toastr: ToastrService,
    private auth : AuthService,
    private flatService : FlatService,
    private tenantRoleMenuService : TenantRoleMenuService
  ) {
    this.currentUserId = this.auth.getUserIdFromToken();
 this.isAdmin = this.auth.isUserAdmin();
     this.tenantRoleMenuService.getPriority("Parking Requests").subscribe({
      next: (res) => {
        console.log(res)
        this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
      },
      error: (err) => {
        this.permission = "READ";
      },
    });

  }


 
  ngOnInit(): void {
    this.loadRequests(0);
  }

  getEmptyRequestForm(): ParkingBookingRequest {
    return {
      parkingSlotId: 0,
      flatId : ''
    };
  }

  loadRequests(page: number = 0) {
    this.loading = true;
    this.parkingBookingService.searchParkingRequest(this.filter, page, this.pageSize).subscribe({
      next: (res) => {
        this.requestsPage = res.content;
        this.totalElements = res.totalElements;
        this.page = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to load parking requests', 'Error');
      }
    });
  }

  deleteRequest(){
  this.loading = true;
    if (!this.actioningRequestId) return;
    this.parkingBookingService.deleteParkingRequest(this.actioningRequestId).subscribe({
      next: (res) => {
        this.loadRequests();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to delete parking requests', 'Error');
      }
    });

  }

    loadUserFlats() {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.loadingFlats = true;
    this.flatService.searchFlatList({ member: userId }).subscribe({
      next: (res) => {
        this.userFlats = res.data || [];
        this.loadingFlats = false;
      },
      error: (err) => {
        this.loadingFlats = false;
        this.toastr.error('Failed to load your flats', 'Error');
      }
    });
  }


  loadAvailableSlots() {
    this.loadingSlots = true;
    this.parkingSlotService.searchParkingSlots(this.slotFilter, 0, 100).subscribe({
      next: (res) => {
        this.availableSlots = res.content;
        this.loadingSlots = false;
      },
      error: () => {
        this.loadingSlots = false;
        this.availableSlots = [];
        this.toastr.error('Failed to load available slots', 'Error');
      }
    });
  }

  selectSlot(slot: ParkingSlot) {
    this.selectedSlot = slot;
    this.requestForm.parkingSlotId = slot.id;
  }

  onPageChange(e: PaginatorState) {
    this.loadRequests(e.page);
  }

  applyFilters() {
    this.loadRequests(0);
  }

  clearFilters() {
    this.filter = {};
    this.loadRequests(0);
  }

  // Request Modal Operations
  openRequestModal() {
    this.requestForm = this.getEmptyRequestForm();
    this.selectedSlot = null;
    this.slotFilter = { status: 'AVAILABLE' };
    this.showRequestModal = true;
    this.loadAvailableSlots();
    this.loadUserFlats()
  }

  closeRequestModal() {
    this.showRequestModal = false;
    this.requestForm = this.getEmptyRequestForm();
    this.selectedSlot = null;
    this.availableSlots = [];
  }

  submitRequest() {
    if (!this.requestForm.parkingSlotId || !this.selectedSlot) {
      this.toastr.warning('Please select a parking slot', 'Warning');
      return;
    }

    this.parkingBookingService.requestParkingSlot(this.requestForm.parkingSlotId,this.requestForm.flatId).subscribe({
      next: () => {
        this.toastr.success('Parking request submitted successfully', 'Success');
        this.closeRequestModal();
        this.loadRequests(this.page);
             this.closeDeleteModal()
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create request', 'Error');
        this.closeDeleteModal()
      }
    });
  }

  // Details Modal
  openDetailsModal(request: ParkingRequest) {
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  // Accept/Reject Operations
  openAcceptModal(requestId: number) {
    this.actioningRequestId = requestId;
    this.showAcceptModal = true;
  }

  closeAcceptModal() {
    this.showAcceptModal = false;
    this.actioningRequestId = null;
  }

   openDeleteModal(requestId: number) {
    this.actioningRequestId = requestId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.actioningRequestId = null;
  }
  confirmAccept() {
    if (!this.actioningRequestId) return;

    this.parkingBookingService.acceptParkingSlotRequest(this.actioningRequestId).subscribe({
      next: () => {
        this.toastr.success('Request accepted successfully', 'Success');
        this.closeAcceptModal();
        this.loadRequests(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to accept request', 'Error');
      }
    });
  }

  openRejectModal(requestId: number) {
    this.actioningRequestId = requestId;
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.actioningRequestId = null;
  }

  confirmReject() {
    if (!this.actioningRequestId) return;

    this.parkingBookingService.rejectParkingSlotRequest(this.actioningRequestId).subscribe({
      next: () => {
        this.toastr.success('Request rejected successfully', 'Success');
        this.closeRejectModal();
        this.loadRequests(this.page);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to reject request', 'Error');
      }
    });
  }

getStatusSeverity(
  status: ParkingRequestStatus | string
): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {

  const severities: Record<number,
    "info" | "success" | "warn" | "danger" | "secondary" | "contrast"
  > = {
    [ParkingRequestStatus.APPROVED]: "success",
    [ParkingRequestStatus.REJECTED]: "danger",
    [ParkingRequestStatus.PENDING]: "warn",
  };

 
  const enumValue =
    typeof status === "string"
      ? ParkingRequestStatus[status as keyof typeof ParkingRequestStatus]
      : status;

  return severities[enumValue] ?? "contrast";
}


getSlotStatusSeverity(
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