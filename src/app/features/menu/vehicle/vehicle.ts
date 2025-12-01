// src/app/features/vehicles/vehicles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Router, RouterModule } from '@angular/router';
import { Vehicle } from '../../../core/service/vehicle.service';
import { UserService } from '../../../core/service/user.service';
import { VehicleCreationRequest, VehicleFilter, Page, User, UserDetails, Vehicle as Vehicles } from '../../../types/types';
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

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicle.html',
  styleUrls: ['./vehicle.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule, RouterModule, ButtonModule, CardModule, FloatLabel, DividerModule, InputTextModule, SelectModule, BadgeModule, DialogModule, ProgressSpinnerModule, FileUploadModule]
})
export class VehiclesManagerComponent implements OnInit {
  vehiclesPage: Page<Vehicles> | null = null;
  loading = false;

  // filters
  filter: VehicleFilter = {};
  page = 0;
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

  vehicleTypes = [
    { name: "Car", code: "CAR" },
    { name: "Bike", code: "BIKE" },
    { name: "Truck", code: "TRUCK" },
    { name: "Van", code: "VAN" },
    { name: "Bus", code: "BUS" },
    { name: "Scooter", code: "SCOOTER" }
  ];

  constructor(
    private vehicleService: Vehicle,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadVehicles(0);
  }

  getEmptyVehicleForm(): VehicleCreationRequest {
    return {
      registrationNumber: '',
      vehicleType: '',
      brand: '',
      model: ''
    };
  }

  loadVehicles(page: number = 0) {
    this.loading = true;
    this.vehicleService.searchVehicle(this.filter, page, this.pageSize).subscribe({
      next: (res) => {
        this.vehiclesPage = res;
        this.page = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load vehicles', 'Error');
      }
    });
  }

  onPageChange(e: PaginatorState) {
    this.loadVehicles(e.page);
  }

  applyFilters() {
    this.loadVehicles(0);
  }

  clearFilters() {
    this.filter = {};
    this.loadVehicles(0);
  }

  // Modal operations
  openCreateModal() {
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.vehicleForm = this.getEmptyVehicleForm();
    this.showVehicleModal = true;
  }

  openEditModal(vehicle: any) {
    this.isEditMode = true;
    this.editingVehicleId = vehicle.id;
    this.vehicleForm = {
      registrationNumber: vehicle.registrationNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model
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
        this.loadVehicles(this.page);
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
        this.loadVehicles(this.page);
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || err.message || 'Unknown error',
          'Failed to delete vehicle'
        );
      }
    });
  }

  // Owner assignment
  openOwnerModal(vehicleId: number) {
    this.assigningVehicleId = vehicleId;
    this.showOwnerModal = true;
    this.loadAvailableUsers();
  }

  closeOwnerModal() {
    this.showOwnerModal = false;
    this.assigningVehicleId = null;
    this.availableUsers = [];
    this.searchUserQuery = '';
  }

  loadAvailableUsers(query: string = '') {
    this.loadingUsers = true;
    this.userService.searchUsers(query, undefined, 0, 50).subscribe({
      next: (res) => {
        this.availableUsers = (res as any).content ?? (res as any).data ?? [];
        this.loadingUsers = false;
      },
      error: (err) => {
        this.loadingUsers = false;
        this.toastr.error('Failed to load users', 'Error');
      }
    });
  }

  searchUsers() {
    this.loadAvailableUsers(this.searchUserQuery);
  }

  viewDetail(vehicleId: number) {
    this.router.navigate(['/menu/vehicles', vehicleId]);
  }

  getVehicleTypeLabel(type: string): string {
    const types: any = {
      'CAR': 'Car',
      'BIKE': 'Bike',
      'TRUCK': 'Truck',
      'VAN': 'Van',
      'BUS': 'Bus',
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastr.warning('Please upload an image file', 'Invalid File Type');
      return;
    }

    // Validate file size (max 5MB)
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
          this.loadVehicles(this.page);
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