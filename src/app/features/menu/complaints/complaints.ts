// src/app/features/complaints/complaints.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ComplaintsService } from '../../../core/service/complaint.service';
import { UserService } from '../../../core/service/user.service';
import { Complaints, ComplaintIssuingRequest, ComplaintsFilter, Page, User } from '../../../types/types';
import { AuthService } from '../../../core/service/auth.service';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.html',
  styleUrls: ['./complaints.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    SelectModule,
    FloatLabel,
    BadgeModule,
    DialogModule,
    ProgressSpinnerModule,
  ]
})
export class ComplaintsManagerComponent implements OnInit {
  complaintsPage: Page<Complaints> | null = null;
  loading = false;

  // filters
  filter: ComplaintsFilter = {};
  page = 0;
  pageSize = 8;

  statusOptions = [
    { name: 'Any Status', code: '' },
    { name: 'Open', code: 'OPEN' },
    { name: 'In Progress', code: 'IN_PROGRESS' },
    { name: 'Resolved', code: 'RESOLVED' },
    { name: 'Rejected', code: 'REJECTED' }
  ];

  priorityOptions = [
    { name: 'Any Priority', code: '' },
    { name: 'Low', code: 'LOW' },
    { name: 'Normal', code: 'NORMAL' },
    { name: 'Urgent', code: 'URGENT' }
  ];

  priorityCreateOptions = [
    { name: 'Low', code: 'LOW' },
    { name: 'Normal', code: 'NORMAL' },
    { name: 'Urgent', code: 'URGENT' }
  ];

  // create modal
  showCreateModal = false;
  newComplaint: Partial<ComplaintIssuingRequest> = {
    title: '',
    description: '',
    category: '',
    raisedByUser: 0,
    priority: 'NORMAL'
  };

  // assign modal
  showAssignModal = false;
  assigningComplaintId: number | null = null;
  availableUsers: User[] = [];
  loadingUsers = false;
  searchUserQuery = '';

  // current user
  currentUserId = 1;

  constructor(
    private complaintsService: ComplaintsService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      const uid = this.auth.getUserIdFromToken?.();
      this.currentUserId = uid ?? this.currentUserId;
    } catch {}
    this.newComplaint.raisedByUser = this.currentUserId;
    this.loadComplaints(0);
  }

  loadComplaints(page: number = 0) {
    this.loading = true;
    this.complaintsService.searchComplaints(this.filter, page, this.pageSize).subscribe({
      next: (res) => {
        this.complaintsPage = res.data;
        this.page = page;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onPageChange(e: PaginatorState) {
    this.loadComplaints(e.page);
  }

  clearFilters() {
    this.filter = {};
    this.loadComplaints(0);
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      this.resetNewComplaint();
    } else {
      this.newComplaint.raisedByUser = this.currentUserId;
    }
  }

  resetNewComplaint() {
    this.newComplaint = {
      title: '',
      description: '',
      category: '',
      raisedByUser: this.currentUserId,
      priority: 'NORMAL'
    };
  }

  createComplaint() {
    if (!this.newComplaint.title || !this.newComplaint.description || !this.newComplaint.category) {
      alert('Please fill required fields.');
      return;
    }
    this.complaintsService.issueComplaint(this.newComplaint as ComplaintIssuingRequest).subscribe({
      next: () => {
        this.toggleCreateModal();
        this.loadComplaints(this.page);
      },
      error: (err) => alert('Failed to create complaint: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  openAssignModal(complaintId: number) {
    this.assigningComplaintId = complaintId;
    this.showAssignModal = true;
    this.loadAssignableUsers();
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.assigningComplaintId = null;
    this.availableUsers = [];
    this.searchUserQuery = '';
  }

  loadAssignableUsers(query: string = '') {
    this.loadingUsers = true;
    this.userService.searchUsers(query, undefined, 0, 50).subscribe({
      next: (res) => {
        const users = (res as any).content ?? (res as any).data ?? res;
        this.availableUsers = users;
        this.loadingUsers = false;
      },
      error: () => (this.loadingUsers = false)
    });
  }

  searchUsers() {
    this.loadAssignableUsers(this.searchUserQuery);
  }

  assignToUser(userId: number) {
    if (!this.assigningComplaintId) return;
    this.complaintsService.assignComplaint(this.assigningComplaintId, userId).subscribe({
      next: () => {
        this.closeAssignModal();
        this.loadComplaints(this.page);
      },
      error: (err) => alert('Failed to assign complaint: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  changeStatus(complaintId: number, status: string) {
    this.complaintsService.changeComplaintStatus(complaintId, status).subscribe({
      next: () => this.loadComplaints(this.page),
      error: (err) => alert('Failed to change status: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  viewDetail(complaintId: number) {
    this.router.navigate(['/menu/complaints', complaintId]);
  }

  reassign(complaintId: number) {
    this.openAssignModal(complaintId);
  }

  getStatusSeverity(status: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    const severities: any = {
      'OPEN': 'info',
      'IN_PROGRESS': 'warn',
      'RESOLVED': 'success',
      'REJECTED': 'danger'
    };
    return severities[status] || 'contrast';
  }

  getPrioritySeverity(priority: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    const severities: any = {
      'LOW': 'success',
      'NORMAL': 'info',
      'URGENT': 'danger'
    };
    return severities[priority] || 'contrast';
  }
}