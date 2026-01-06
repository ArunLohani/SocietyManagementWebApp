// src/app/features/complaints/complaint-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ComplaintsService } from '../../../../core/service/complaint.service';
import { UserService } from '../../../../core/service/user.service';
import { Complaints, ComplaintIssuingRequest, User } from '../../../../types/types';
import { AuthService } from '../../../../core/service/auth.service';
import { TenantRoleMenuService } from '../../../../core/service/tenant-role-menu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-complaint-detail',
  templateUrl: './complaint-detail.html',
  styleUrls: ['./complaint-detail.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    SelectModule,
    FloatLabel,
    BadgeModule,
    ProgressSpinnerModule,
  ]
})
export class ComplaintDetailComponent implements OnInit {
  complaintId!: number;
  complaint: Complaints | null = null;
  loading = false;

  // edit mode
  editMode = false;
  editModel: Partial<Complaints> = {};

  priorityOptions = [
    { name: 'Low', code: 'LOW' },
    { name: 'Normal', code: 'NORMAL' },
    { name: 'Urgent', code: 'URGENT' }
  ];

  // assignment
  availableUsers: User[] = [];
  loadingUsers = false;
  assignSearch = '';

  // resolution note
  resolutionNote = '';

  currentUserId: number | null = null;
  // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";
  constructor(
    private route: ActivatedRoute,
    private complaintsService: ComplaintsService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private tenantRoleMenuService : TenantRoleMenuService,
    private toastrService : ToastrService
  ) {
this.tenantRoleMenuService.getPriority("Complaints").subscribe({
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
    this.complaintId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUserId = this.auth.getUserId() ?? null;
    this.loadComplaint();
    if(this.isAdmin()){
  this.searchAssignableUsers("")
    }
  }

  isAdmin(){
    return this.auth.isUserAdmin();
  }

  isAuthor(){
    return this.complaint?.raisedByUser.id === this.auth.getUserId()
  }

  isAssigned(){
      if(this.complaint?.assignedToUser) 
        this.complaint?.assignedToUser.id === this.auth.getUserId()
      return false;
  }

  loadComplaint() {
    this.loading = true;
    this.complaintsService.getComplaintById(this.complaintId).subscribe({
      next: (res) => {
        this.complaint = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  enterEdit() {
    if (!this.complaint) return;
    this.editMode = true;
    this.editModel = { ...this.complaint };
  }

  cancelEdit() {
    this.editMode = false;
    this.editModel = {};
  }

  saveEdit() {
    if (!this.complaint) return;
    const updated: ComplaintIssuingRequest = {
      title: this.editModel.title ?? this.complaint.title,
      description: this.editModel.description ?? this.complaint.description,
      category: this.editModel.category ?? this.complaint.category,
      priority: this.editModel.priority ?? this.complaint.priority,
      raisedByUser: 0
    };

    this.complaintsService.updateComplaint(this.complaintId, updated).subscribe({
      next: (res) => {
        this.editMode = false;
        this.loadComplaint();
      }
    });
  }

  searchAssignableUsers(q: string) {
    this.loadingUsers = true;
    this.userService.searchUsersList(q, undefined).subscribe({
      next: (res) => {
        this.availableUsers = (res as any).content ?? (res as any).data ?? res;
        this.loadingUsers = false;
      },
      error: () => (this.loadingUsers = false)
    });
  }

  assignToUser(userId: number) {
    this.complaintsService.assignComplaint(this.complaintId, userId).subscribe({
      next: () => this.loadComplaint(),
      error: (err) =>    this.toastrService.error('Failed to assgin user : ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  changeStatus(status: string) {
    this.complaintsService.changeComplaintStatus(this.complaintId, status).subscribe({
      next: () => this.loadComplaint(),
      error: (err) =>     this.toastrService.error('Failed to change status: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  addResolutionNotes() {
    if (!this.resolutionNote.trim()) {
          this.toastrService.error('Please enter a resolution note.')
      return;
    }
    this.complaintsService.addResolutionNotes(this.complaintId, this.resolutionNote).subscribe({
      next: () => {
        this.resolutionNote = '';
        this.loadComplaint();
      },
      error: (err) =>     this.toastrService.error('Failed to add resolution note: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  backToList() {
    this.router.navigate(['/menu/complaints']);
  }

  getStatusSeverity(status: string): 'info'|'success' | 'info' | 'danger' | 'contrast' {
    const severities: any = {
      'OPEN': 'info',
      'IN_PROGRESS': 'warn',
      'RESOLVED': 'success',
      'REJECTED': 'danger'
    };
    return severities[status] || 'contrast';
  }

  getPrioritySeverity(priority: string): 'success' | 'info' | 'danger' | 'contrast' {
    const severities: any = {
      'LOW': 'success',
      'NORMAL': 'info',
      'URGENT': 'danger'
    };
    return severities[priority] || 'contrast';
  }
}