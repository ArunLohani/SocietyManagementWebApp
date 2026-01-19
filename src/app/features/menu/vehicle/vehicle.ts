// src/app/features/vehicles/vehicles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Router, RouterModule } from '@angular/router';
import { Vehicle } from '../../../core/service/vehicle.service';
import { UserService } from '../../../core/service/user.service';
import { VehicleCreationRequest, VehicleFilter, Page, User, UserDetails, Vehicle as Vehicles, Flat } from '../../../types/types';
import { AuthService } from '../../../core/service/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadEvent } from "primeng/fileupload";
import { ToastrService } from 'ngx-toastr';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';
import { FlatService } from '../../../core/service/flat.service';
import { Message } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicle.html',
  styleUrls: ['./vehicle.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PaginatorModule, 
    RouterModule, 
    ButtonModule, 
    CardModule, 
    FloatLabel, 
    DividerModule, 
    InputTextModule, 
    SelectModule, 
    BadgeModule, 
    DialogModule, 
    ProgressSpinnerModule, 
    FileUploadModule,
    Message,
    TabsModule
  ]
})
export class VehiclesManagerComponent implements OnInit {
  // Tab management
  activeTab = 0;
  isAdmin = false;
  currentUserId: number | null = null;

  // Vehicles data
  userVehiclesPage: Page<Vehicles> | null = null;
  societyVehiclesPage: Page<Vehicles> | null = null;
  loading = false;

  // filters
  userFilter: VehicleFilter = {};
  societyFilter: VehicleFilter = {};
  userPage = 0;
  societyPage = 0;
  pageSize = 8;

  // create/edit modal
  showVehicleModal = false;
  isEditMode = false;
  editingVehicleId: number | null = null;
  vehicleForm: VehicleCreationRequest = this.getEmptyVehicleForm();

  // delete confirmation
  showDeleteModal = false;
  deletingVehicleId: number | null = null;

  //image upload modal
  showImageUploadModal = false;
  selectedVehicleImage: any = null;
  uploadingImage = false;

  // owner assignment
  showOwnerModal = false;
  assigningVehicleId: number | null = null;
  availableUsers: UserDetails[] = [];
  loadingUsers = false;
  searchUserQuery = '';
  loadingFlats = false;
  userFlats: Flat[] = [];
  
  vehicleTypes = [
    { name: "Car", code: "CAR" },
    { name: "Bike", code: "BIKE" },
    { name: "Scooter", code: "SCOOTER" }
  ];

  // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private vehicleService: Vehicle,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private tenantRoleMenuService: TenantRoleMenuService,
    private flatService: FlatService
  ) {
    this.isAdmin = this.auth.isUserAdmin();
    this.currentUserId = this.auth.getUserId();
    
    this.tenantRoleMenuService.getPriority("Vehicle").subscribe({
      next: (res) => {
        this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
      },
      error: (err) => {
        this.permission = "READ";
      },
    });
  }

  ngOnInit(): void {
    this.loadUserVehicles(0);
    if (this.isAdmin) {
      this.loadSocietyVehicles(0);
    }
  }

  loadUserFlats() {
    if (!this.currentUserId) return;

    this.loadingFlats = true;
    this.flatService.searchFlatList({ member: this.currentUserId }).subscribe({
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

  getEmptyVehicleForm(): VehicleCreationRequest {
    return {
      registrationNumber: '',
      vehicleType: '',
      brand: '',
      model: '',
      flat: ''
    };
  }

  loadUserVehicles(page: number = 0) {
    if (!this.currentUserId) return;

    this.loading = true;
    this.userFilter.user = this.currentUserId;
    
    this.vehicleService.searchVehicle(this.userFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.userVehiclesPage = res;
        this.userPage = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load your vehicles', 'Error');
      }
    });
  }

  loadSocietyVehicles(page: number = 0) {
    this.loading = true;
    
    this.vehicleService.searchVehicle(this.societyFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.societyVehiclesPage = res;
        this.societyPage = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load society vehicles', 'Error');
      }
    });
  }

  onUserPageChange(e: PaginatorState) {
    this.loadUserVehicles(e.page);
  }

  onSocietyPageChange(e: PaginatorState) {
    this.loadSocietyVehicles(e.page);
  }

  applyUserFilters() {
    this.loadUserVehicles(0);
  }

  clearUserFilters() {
    this.userFilter = { user: this.currentUserId! };
    this.loadUserVehicles(0);
  }

  applySocietyFilters() {
    this.loadSocietyVehicles(0);
  }

  clearSocietyFilters() {
    this.societyFilter = {};
    this.loadSocietyVehicles(0);
  }

  // Modal operations
  openCreateModal() {
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.vehicleForm = this.getEmptyVehicleForm();
    this.showVehicleModal = true;
    this.loadUserFlats();
  }

  openEditModal(vehicle: any) {
    this.loadUserFlats();
    this.isEditMode = true;
    this.editingVehicleId = vehicle.id;
    this.vehicleForm = {
      registrationNumber: vehicle.registrationNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      flat: vehicle.owner.id
    };
    this.showVehicleModal = true;
  }

  closeVehicleModal() {
    this.showVehicleModal = false;
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.vehicleForm = this.getEmptyVehicleForm();
  }

  saveVehicle() {
    if (!this.vehicleForm.registrationNumber || !this.vehicleForm.brand || !this.vehicleForm.model) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    const operation = this.isEditMode && this.editingVehicleId
      ? this.vehicleService.updateVehicle(this.editingVehicleId, this.vehicleForm)
      : this.vehicleService.registerVehicle(this.vehicleForm);

    operation.subscribe({
      next: () => {
        this.toastr.success(
          `Vehicle ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Success'
        );
        this.closeVehicleModal();
        this.loadUserVehicles(this.userPage);
        if (this.isAdmin) {
          this.loadSocietyVehicles(this.societyPage);
        }
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || err.message || 'Unknown error',
          `Failed to ${this.isEditMode ? 'update' : 'create'} vehicle`
        );
      }
    });
  }

  // Delete operations
  openDeleteModal(vehicleId: number) {
    this.deletingVehicleId = vehicleId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingVehicleId = null;
  }

  confirmDelete() {
    if (!this.deletingVehicleId) return;

    this.vehicleService.deleteVehicle(this.deletingVehicleId).subscribe({
      next: () => {
        this.toastr.success('Vehicle deleted successfully', 'Success');
        this.closeDeleteModal();
        this.loadUserVehicles(this.userPage);
        if (this.isAdmin) {
          this.loadSocietyVehicles(this.societyPage);
        }
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || err.message || 'Unknown error',
          'Failed to delete vehicle'
        );
      }
    });
  }

  viewDetail(vehicleId: number) {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  getVehicleTypeLabel(type: string): string {
    const types: any = {
      'CAR': 'Car',
      'BIKE': 'Bike',
      'SCOOTER': 'Scooter'
    };
    return types[type] || type;
  }

  openVehicleImageUploadModal(vehicle: any) {
    this.editingVehicleId = vehicle.id;
    this.showImageUploadModal = true;
  }

  closeVehicleImageUploadModal() {
    this.editingVehicleId = null;
    this.showImageUploadModal = false;
    this.uploadingImage = false;
  }

  onUpload(event: FileUploadHandlerEvent) {
    if (!this.editingVehicleId) return;

    const file: File = event.files[0];

    if (!file.type.startsWith('image/')) {
      this.toastr.warning('Please upload an image file', 'Invalid File Type');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.warning('File size should not exceed 5MB', 'File Too Large');
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    this.uploadingImage = true;

    this.vehicleService.uploadVehicleImage(this.editingVehicleId, formData)
      .subscribe({
        next: () => {
          this.uploadingImage = false;
          this.toastr.success('Vehicle image uploaded successfully', 'Success');
          this.closeVehicleImageUploadModal();
          this.loadUserVehicles(this.userPage);
          if (this.isAdmin) {
            this.loadSocietyVehicles(this.societyPage);
          }
        },
        error: (err) => {
          this.uploadingImage = false;
          this.toastr.error(
            err.error?.message || err.message || 'Unknown error',
            'Upload Failed'
          );
        }
      });
  }
}