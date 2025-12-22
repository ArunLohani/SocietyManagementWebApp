// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabPanel, TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/service/user.service';
import { FlatService } from '../../core/service/flat.service';
import { FlatMemberService } from '../../core/service/flatMember.service';
import { AuthService } from '../../core/service/auth.service';
import { MailService } from '../../core/service/mail.service';
import {
  Flat,
  FlatCreationRequest,
  FlatCategory,
  FlatMemberAddRequest,
  FlatMembershipType,
  UserDetails,
  FlatMember
} from '../../types/types';
import { PaymentService } from '../../core/service/payment.sevice';
import { catchError, map, Observable, of, retry } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TabsModule,
    DividerModule,
    InputTextModule,
    SelectModule,
    FloatLabel,
    DialogModule,
    ProgressSpinnerModule,
    BadgeModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  tenancyStatus = false;
  loading = false;
  isAdmin = false;
  currentUserId: number | null = null;
  activeTab = 0;

  // Flats data
  societyFlats: Flat[] = [];
  userFlats: Flat[] = [];
  loadingFlats = false;

  // Flat creation
  showFlatModal = false;
  flatForm: FlatCreationRequest = this.getEmptyFlatForm();

  flatCategories = [
    { label: '1 BHK', value: 'ONE_BHK' },
    { label: '2 BHK', value: 'TWO_BHK' },
    { label: '3 BHK', value: 'THREE_BHK' },
    { label: 'Duplex', value: 'DUPLEX' },
    { label: 'Studio', value: 'STUDIO' }
  ];

  // Owner assignment
  showOwnerModal = false;
  selectedFlatId: number | null = null;
  availableUsers: UserDetails[] = [];
  loadingUsers = false;
  searchUserQuery = '';

  // Member management
  showMemberModal = false;
  memberForm: FlatMemberAddRequest = {
    flatId: 0,
    userId: 0,
    type: FlatMembershipType.FAMILY
  };

  memberTypes = [
    { label: 'Family', value: 'FAMILY' },
    { label: 'Tenant', value: 'TENANT' },
    { label: 'Guest', value: 'GUEST' }
  ];

  // Delete confirmation
  showDeleteModal = false;
  deletingFlatId: number | null = null;

  showRemoveModal = false;
  removingMemberId : number | null = null

  // Mail functionality
  showNoticeModal = false;
  showEmergencyModal = false;
  showReminderModal = false;
  selectedMailFlatId: number | null = null;
  noticeMessage = '';
  emergencyMessage = '';
  sendingMail = false;

  constructor(
    private userService: UserService,
    private flatService: FlatService,
    private flatMemberService: FlatMemberService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private payment: PaymentService,
    private mailService: MailService
  ) {
    this.isAdmin = this.authService.isUserAdmin();
    this.currentUserId = this.authService.getUserIdFromToken();
  }

  ngOnInit(): void {
    this.checkTenancyStatus();
  }

  checkTenancyStatus() {
    this.loading = true;
    this.userService.checkTenancyStatus().subscribe({
      next: (response) => {
        this.tenancyStatus = response.data;
        this.loading = false;
        if (this.tenancyStatus) {
          this.loadFlats();
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to check tenancy status', 'Error');
      }
    });
  }
getActiveMembers(flat: Flat) {
  return flat.members?.filter(member => member.isActive);
}

  loadFlats() {
    this.loadingFlats = true;

    if (this.isAdmin) {
      this.flatService.searchFlatList({}).subscribe({
        next: (res) => {
          this.societyFlats = res.data || [];
          this.loadUserFlats();
        },
        error: (err) => {
          this.loadingFlats = false;
          this.toastr.error('Failed to load society flats', 'Error');
        }
      });
    } else {
      this.loadUserFlats();
    }
  }

  loadUserFlats() {
    if (!this.currentUserId) {
      this.loadingFlats = false;
      return;
    }

    this.flatService.searchFlatList({ member: this.currentUserId }).subscribe({
      next: (res) => {
        this.userFlats = (res.data || []).map(flat => ({
          ...flat,
          isOwner: flat.members?.some(m => m.user?.id === this.currentUserId && m.type.toString() === 'OWNER')
        }));

        this.userFlats.forEach(flat => {
          if (!flat.id) {
            flat.hasActivePayment = false;
            return;
          }
          this.payment.checkActivePayment(flat.id).subscribe({
            next: (res) => {
              flat.hasActivePayment = res.data
            },
            error: (err) => {
              flat.hasActivePayment = false;
            },
          })
        });

        this.loadingFlats = false;
      },
      error: (err) => {
        this.loadingFlats = false;
        this.toastr.error('Failed to load your flats', 'Error');
      }
    });
  }

  // Flat CRUD operations
  getEmptyFlatForm(): FlatCreationRequest {
    return {
      block: '',
      number: 0,
      floor: 0,
      sqFt: 0,
      category: FlatCategory.ONE_BHK
    };
  }

  openCreateFlatModal() {
    this.flatForm = this.getEmptyFlatForm();
    this.showFlatModal = true;
  }

  closeFlatModal() {
    this.showFlatModal = false;
    this.flatForm = this.getEmptyFlatForm();
  }

  showRemoveMemberModal(memberId : number){
    this.removingMemberId = memberId;
    this.showRemoveModal = true;
  }

  closeRemoveMemberModal(){
    this.removingMemberId= null;
    this.showRemoveModal = false;
  }

  onConfirmRemoval(){
    if(!this.removingMemberId) return;
    this.removeMember(this.removingMemberId);
    this.closeRemoveMemberModal();
  }

  saveFlat() {
    if (!this.flatForm.block || !this.flatForm.number || !this.flatForm.floor) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.flatService.createFlat(this.flatForm).subscribe({
      next: () => {
        this.toastr.success('Flat created successfully', 'Success');
        this.closeFlatModal();
        this.loadFlats();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create flat', 'Error');
      }
    });
  }

  openDeleteModal(flatId: number) {
    this.deletingFlatId = flatId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingFlatId = null;
  }

  confirmDelete() {
    if (!this.deletingFlatId) return;

    this.flatService.deleteFlat(this.deletingFlatId).subscribe({
      next: () => {
        this.toastr.success('Flat deleted successfully', 'Success');
        this.closeDeleteModal();
        this.loadFlats();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to delete flat', 'Error');
      }
    });
  }

  // Owner assignment
  openOwnerModal(flatId: number) {
    this.selectedFlatId = flatId;
    this.showOwnerModal = true;
    this.loadAvailableUsers();
  }

  closeOwnerModal() {
    this.showOwnerModal = false;
    this.selectedFlatId = null;
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

  assignOwner(userId: number) {
    if (!this.selectedFlatId) return;

    this.flatMemberService.addOwnerToFlat(this.selectedFlatId, userId).subscribe({
      next: () => {
        this.toastr.success('Owner assigned successfully', 'Success');
        this.closeOwnerModal();
        this.loadFlats();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to assign owner', 'Error');
      }
    });
  }

  // Member management
  openMemberModal(flatId: number) {
    this.memberForm = {
      flatId: flatId,
      userId: 0,
      type: FlatMembershipType.FAMILY
    };
    this.showMemberModal = true;
    this.loadAvailableUsers();
  }

  closeMemberModal() {
    this.showMemberModal = false;
    this.memberForm = {
      flatId: 0,
      userId: 0,
      type: FlatMembershipType.FAMILY
    };
  }

  addMember() {
    if (!this.memberForm.userId) {
      this.toastr.warning('Please select a user', 'Validation Error');
      return;
    }

    this.flatMemberService.addMemberToFlat(this.memberForm).subscribe({
      next: () => {
        this.toastr.success('Member added successfully', 'Success');
        this.closeMemberModal();
        this.loadFlats();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to add member', 'Error');
      }
    });
  }

  removeMember(memberId: number) {
 

    this.flatMemberService.removeMemberFromFlat(memberId).subscribe({
      next: () => {
        this.toastr.success('Member removed successfully', 'Success');
        this.loadFlats();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to remove member', 'Error');
      }
    });
  }
canRemoveMember(flat: Flat, member: FlatMember,flatType : string): boolean {
  if (!this.currentUserId) return false;

  if(flatType == 'User'){

     const isOwnerOfFlat = this.isOwner(flat);
  if (isOwnerOfFlat && member.type.toString() !== 'OWNER') {
    return true;
  }

  }
  else{
     if (this.isAdmin && member.type.toString() === 'OWNER') {
    return true;
  }
  }
  
  
  return false;
}
  // Mail functionality
  sendMaintenanceReminder(flatId: number) {
    this.selectedMailFlatId = flatId;
    this.showReminderModal = true;
  }

  closeReminderModal() {
    this.showReminderModal = false;
    this.selectedMailFlatId = null;
  }

  confirmSendReminder() {
    if (!this.selectedMailFlatId) return;

    this.sendingMail = true;
    this.mailService.sendPendingMaintenanceReminder(this.selectedMailFlatId).subscribe({
      next: () => {
        this.toastr.success('Maintenance reminder sent successfully', 'Success');
        this.closeReminderModal();
        this.sendingMail = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to send reminder', 'Error');
        this.sendingMail = false;
      }
    });
  }

  openNoticeModal(flatId: number) {
    this.selectedMailFlatId = flatId;
    this.noticeMessage = '';
    this.showNoticeModal = true;
  }

  closeNoticeModal() {
    this.showNoticeModal = false;
    this.selectedMailFlatId = null;
    this.noticeMessage = '';
  }

  sendNotice() {
    if (!this.selectedMailFlatId || !this.noticeMessage.trim()) {
      this.toastr.warning('Please enter a notice message', 'Validation Error');
      return;
    }

    this.sendingMail = true;
    this.mailService.sendSocietyNotice(this.selectedMailFlatId, this.noticeMessage).subscribe({
      next: () => {
        this.toastr.success('Notice sent successfully', 'Success');
        this.closeNoticeModal();
        this.sendingMail = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to send notice', 'Error');
        this.sendingMail = false;
      }
    });
  }

  openEmergencyModal(flatId: number) {
    this.selectedMailFlatId = flatId;
    this.emergencyMessage = '';
    this.showEmergencyModal = true;
  }

  closeEmergencyModal() {
    this.showEmergencyModal = false;
    this.selectedMailFlatId = null;
    this.emergencyMessage = '';
  }

  sendEmergencyAlert() {
    if (!this.selectedMailFlatId || !this.emergencyMessage.trim()) {
      this.toastr.warning('Please enter an emergency message', 'Validation Error');
      return;
    }

    this.sendingMail = true;
    this.mailService.sendEmergencyAlert(this.selectedMailFlatId, this.emergencyMessage).subscribe({
      next: () => {
        this.toastr.success('Emergency alert sent successfully', 'Success');
        this.closeEmergencyModal();
        this.sendingMail = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to send alert', 'Error');
        this.sendingMail = false;
      }
    });
  }

  // Navigation
  payMaintenance(flatId: number) {
    this.router.navigate(['/menu/pay'], { queryParams: { flatId } });
  }

  // Utility methods
  getCategoryLabel(category: string): string {
    const cat = this.flatCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getMemberTypeLabel(type: string): string {
    const typeLabels: any = {
      'OWNER': 'Owner',
      'FAMILY': 'Family',
      'TENANT': 'Tenant',
      'GUEST': 'Guest'
    };
    return typeLabels[type] || type;
  }

  getMemberTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'secondary' {
    const severities: any = {
      'OWNER': 'success',
      'FAMILY': 'info',
      'TENANT': 'warn',
      'GUEST': 'secondary'
    };
    return severities[type] || 'secondary';
  }

  isOwner(flat: Flat): boolean {
    if (!this.currentUserId) return false;
    return flat.members?.some(m =>
      m.user?.id === this.currentUserId && m.type.toString() === 'OWNER'
    ) || false;
  }

  hasOwner(flat: Flat): boolean {
    return flat.members?.some(m =>m.isActive &&  m.type.toString() === 'OWNER') || false;
  }
}