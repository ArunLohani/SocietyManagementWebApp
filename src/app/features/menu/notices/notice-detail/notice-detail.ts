// src/app/features/notices/notice-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { NoticesService } from '../../../../core/service/notice.service';
import { Notice, NoticeCreationRequest } from '../../../../types/types';
import { AuthService } from '../../../../core/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TenantRoleMenuService } from '../../../../core/service/tenant-role-menu.service';

@Component({
  selector: 'app-notice-detail',
  templateUrl: './notice-detail.html',
  styleUrls: ['./notice-detail.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    FloatLabel,
    BadgeModule,
    ProgressSpinnerModule,
    CheckboxModule
  ]
})
export class NoticeDetailComponent implements OnInit {
  noticeId!: number;
  notice: Notice | null = null;
  loading = false;

  editMode = false;
  editModel: Partial<Notice> = {};

  tenantId: number | null = null;
  currentUserId: number | null = null;
  permission: "READ" | "EDIT" | "CREATE" = "READ";
  constructor(
    private route: ActivatedRoute,
    private noticesService: NoticesService,
    private auth: AuthService,
    private router: Router,
    private toastrService : ToastrService,
    private tenantRoleMenuService : TenantRoleMenuService
  ) { this.tenantRoleMenuService.getPriority("Notices").subscribe({
      next: (res) => {
        console.log(res)
        this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
      },
      error: (err) => {
        this.permission = "READ";
      },
    });}

  ngOnInit(): void {
    this.noticeId = Number(this.route.snapshot.paramMap.get('id'));
    try {
      this.tenantId = this.auth.getTenantIdFromToken?.() ?? null;
    } catch {}
    try {
      this.currentUserId = this.auth.getUserIdFromToken?.() ?? null;
    } catch {}
    this.loadNotice();
  }

  loadNotice() {
    this.loading = true;
    this.noticesService.getNoticeById(this.noticeId).subscribe({
      next: (res) => {
        this.notice = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  enterEdit() {
    if (!this.notice) return;
    this.editMode = true;
    this.editModel = { ...this.notice };
  }

  cancelEdit() {
    this.editMode = false;
    this.editModel = {};
  }

  saveEdit() {
    if (!this.notice) return;
    const payload: NoticeCreationRequest = {
      title: this.editModel.title ?? this.notice.title,
      message: this.editModel.message ?? this.notice.message,
      category: this.editModel.category ?? this.notice.category,
      isPublic: this.editModel.isPublic ?? this.notice.isPublic,
      isExpired: this.editModel.isExpired ?? this.notice.isExpired
    };
    this.noticesService.updateNotice(this.noticeId, payload).subscribe({
      next: () => {
        this.editMode = false;
        this.loadNotice();
      },
      error: (err) => this.toastrService.error('Failed to update notice: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  togglePublic() {
    this.noticesService.togglePublic(this.noticeId).subscribe({
      next: () => this.loadNotice(),
      error: (err) => this.toastrService.error('Failed to toggle public: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  toggleExpired() {
    this.noticesService.toggleExpired(this.noticeId).subscribe({
      next: () => this.loadNotice(),
      error: (err) => this.toastrService.error('Failed to toggle expired: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  backToList() {
    this.router.navigate(['/menu/notices']);
  }

  getStatusSeverity(isExpired: boolean): 'danger' | 'success' {
    return isExpired ? 'danger' : 'success';
  }
}