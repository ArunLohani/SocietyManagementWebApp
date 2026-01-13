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
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastrService } from 'ngx-toastr';
import { 
  ImpersonationSession as ImpersonationSessionType, 
  ImpersonationSessionFilter, 
  Page,
  CurrentImpersonationDto
} from '../../types/types';
import { ImpersonationSessionService } from '../../core/service/impersonation-session';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-impersonation-sessions',
  templateUrl: './session-management.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorModule,
    ButtonModule,
    CardModule,
    FloatLabel,
    DividerModule,
    InputTextModule,
    SelectModule,
    BadgeModule,
    DialogModule,
    ProgressSpinnerModule,
    TabsModule,
    DatePickerModule,
    TableModule,
    TagModule
  ]
})
export class ImpersonationSessionsComponent implements OnInit {
  activeTab = 0;
  isSuperAdmin = false;
  currentUserId: number | null = null;

  // Session data
  activeSessionsPage: Page<ImpersonationSessionType> | null = null;
  allSessionsPage: Page<ImpersonationSessionType> | null = null;
  
  loading = false;

  // Filters for Active Sessions (only non-ended sessions)
  activeSessionsFilter: ImpersonationSessionFilter = {
    endedAtIsNull: true,
    isActive: true,
    sortFilter: { property: 'expiresAt', asc: false }
  };
  
  // Filters for All Sessions
  allSessionsFilter: ImpersonationSessionFilter = {
    isActive: true,
    sortFilter: { property: 'id', asc: false }
  };

  activeSessionsPageNum = 0;
  allSessionsPageNum = 0;
  pageSize = 10;

  // View session modal
  showViewModal = false;
  selectedSession: ImpersonationSessionType | null = null;

  // Confirmation dialog
  showConfirmDialog = false;
  sessionToRevoke: number | null = null;
  processingRevoke = false;

  constructor(
    private sessionService: ImpersonationSessionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.isSuperAdmin = this.authService.isUserSuperAdmin();
    this.currentUserId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadActiveSessions(0);
    this.loadAllSessions(0);
  }

  loadActiveSessions(page: number = 0) {
    this.loading = true;
    this.sessionService.getSessionsPaginated(this.activeSessionsFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.activeSessionsPage = res;
        this.activeSessionsPageNum = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load active sessions', 'Error');
      }
    });
  }

  loadAllSessions(page: number = 0) {
    this.loading = true;
    this.sessionService.getSessionsPaginated(this.allSessionsFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.allSessionsPage = res;
        this.allSessionsPageNum = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load sessions', 'Error');
      }
    });
  }

  onActiveSessionsPageChange(e: PaginatorState) {
    this.loadActiveSessions(e.page ?? 0);
  }

  onAllSessionsPageChange(e: PaginatorState) {
    this.loadAllSessions(e.page ?? 0);
  }

  applyActiveSessionsFilters() {
    this.activeSessionsFilter.endedAtIsNull = true;
    this.loadActiveSessions(0);
  }

  clearActiveSessionsFilters() {
    this.activeSessionsFilter = {
      endedAtIsNull: true,
      isActive: true,
      sortFilter: { property: 'expiresAt', asc: false }
    };
    this.loadActiveSessions(0);
  }

  applyAllSessionsFilters() {
    this.loadAllSessions(0);
  }

  clearAllSessionsFilters() {
    this.allSessionsFilter = {
      isActive: true,
      sortFilter: { property: 'id', asc: false }
    };
    this.loadAllSessions(0);
  }

  openViewModal(session: ImpersonationSessionType) {
    this.selectedSession = session;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedSession = null;
  }

  confirmRevokeSession(sessionId: number) {
    this.sessionToRevoke = sessionId;
    this.showConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
    this.sessionToRevoke = null;
  }

  revokeSession() {
    if (!this.sessionToRevoke) return;

    this.processingRevoke = true;
    this.sessionService.endImpersonation(this.sessionToRevoke).subscribe({
      next: () => {
        this.toastr.success('Impersonation session revoked successfully', 'Success');
        this.processingRevoke = false;
        this.closeConfirmDialog();
        this.loadActiveSessions(this.activeSessionsPageNum);
        this.loadAllSessions(this.allSessionsPageNum);
      },
      error: (err) => {
        this.processingRevoke = false;
        this.toastr.error(err.error?.message || 'Failed to revoke session', 'Error');
      }
    });
  }

  isSessionExpired(expiresAt: Date): boolean {
    return new Date(expiresAt) < new Date();
  }

  isSessionActive(session: ImpersonationSessionType): boolean {
    return !session.endedAt && !this.isSessionExpired(session.expiresAt);
  }

  canRevokeSession(session: ImpersonationSessionType): boolean {
    // Can revoke if session has not ended yet (endedAt is null)
    return !session.endedAt;
  }

  getSessionStatusSeverity(session: ImpersonationSessionType): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" | null | undefined {
    if (session.endedAt) return 'secondary';
    if (this.isSessionExpired(session.expiresAt)) return 'danger';
    return 'success';
  }

  getSessionStatusLabel(session: ImpersonationSessionType): string {
    if (session.endedAt) return 'Ended';
    if (this.isSessionExpired(session.expiresAt)) return 'Expired';
    return 'Active';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }

  getSuperAdminInfo(session: ImpersonationSessionType): string {
    if (session.superAdmin) {
      return `${session.superAdmin.name} (${session.superAdmin.email})`;
    }
    return session.superAdmin ? `User ID: ${session.superAdmin}` : 'Unknown';
  }

  getSuperAdminName(session: ImpersonationSessionType): string {
    return session.superAdmin?.name || `User #${session.superAdmin.name || 'Unknown'}`;
  }
}