// src/app/features/notices/notices.component.ts
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
import { CheckboxModule } from 'primeng/checkbox';
import { NoticesService } from '../../../core/service/notice.service';
import { UserService } from '../../../core/service/user.service';
import { Notice, NoticeCreationRequest, NoticeFilter, Page, Tenant } from '../../../types/types';
import { AuthService } from '../../../core/service/auth.service';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.html',
  styleUrls: ['./notices.css'],
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

    CheckboxModule
  ]
})
export class NoticesManagerComponent implements OnInit {
  noticesPage: Page<Notice> | null = null;
  loading = false;

  // filters & pagination
  filter: NoticeFilter = {};
  page = 0;
  pageSize = 8;

  publicOptions = [
    { name: 'All', code: null },
    { name: 'Public', code: true },
    { name: 'Private', code: false }
  ];

  expiredOptions = [
    { name: 'Any', code: null },
    { name: 'Active', code: false },
    { name: 'Expired', code: true }
  ];

  // create modal
  showCreateModal = false;
  newNotice: Partial<NoticeCreationRequest> = this.emptyNotice();

  // current tenant/user
  tenantId: number | null = null;
  currentUserId: number | null = null;

    // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private noticesService: NoticesService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private tenantRoleMenuService : TenantRoleMenuService,
    private toastrService : ToastrService
  ) { 
    this.tenantRoleMenuService.getPriority("Notices").subscribe({
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
    try {
      this.tenantId = this.auth.getTenantId() ?? null;
    } catch {}
    try {
      this.currentUserId = this.auth.getUserId() ?? null;
    } catch {}
    if (this.tenantId) this.filter.tenantId = this.tenantId;
    this.loadNotices(0);
  }

  emptyNotice(): Partial<NoticeCreationRequest> {
    return {
      title: '',
      message: '',
      category: '',
      isPublic: false,
      isExpired: false
    };
  }

  loadNotices(page: number = 0) {
    this.loading = true;
    if (this.filter && (this.filter.title || this.filter.category || this.filter.isPublic !== undefined || this.filter.isExpired !== undefined || this.filter.tenantId)) {
      this.noticesService.searchNotices(this.filter, page, this.pageSize).subscribe({
        next: (res) => {
          this.noticesPage = res.data;
          this.page = page;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      if (this.tenantId !== null) {
        this.noticesService.getNoticesForTenant(this.tenantId, page, this.pageSize).subscribe({
          next: (res) => {
            this.noticesPage = res.data;
            this.page = page;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      } else {
        this.noticesService.searchNotices(this.filter, page, this.pageSize).subscribe({
          next: (res) => {
            this.noticesPage = res.data;
            this.page = page;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      }
    }
  }

  onPageChange(e: PaginatorState) {
    this.loadNotices(e.page);
  }

  searchNotices() {
    this.loadNotices(0);
  }

  clearFilters() {
    this.filter = {};
    if (this.tenantId) this.filter.tenantId = this.tenantId;
    this.loadNotices(0);
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) this.newNotice = this.emptyNotice();
  }

  createNotice() {
    if (!this.newNotice.title || !this.newNotice.message || !this.newNotice.category) {
       this.toastrService.error('Please fill required fields.')
      return;
    }
    this.noticesService.createNotice(this.newNotice as NoticeCreationRequest).subscribe({
      next: () => {
        this.toggleCreateModal();
        this.loadNotices(this.page);
      },
      error: (err) =>  this.toastrService.error('Failed to pulish notice: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  goToNotice(id: number) {
    this.router.navigate(['/menu/notices', id]);
  }

  togglePublic(noticeId: number) {
    this.noticesService.togglePublic(noticeId).subscribe({
      next: () => this.loadNotices(this.page),
      error: (err) => this.toastrService.error('Failed to make notice public: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  toggleExpired(noticeId: number) {
    this.noticesService.toggleExpired(noticeId).subscribe({
      next: () => this.loadNotices(this.page),
      error: (err) =>this.toastrService.error('Failed to toggle expired: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  getStatusSeverity(isExpired: boolean): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    return isExpired ? 'danger' : 'success';
  }
}