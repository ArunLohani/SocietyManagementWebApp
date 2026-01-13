import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { ImpersonationSessionService } from '../../core/service/impersonation-session';
import { CurrentImpersonationDto } from '../../types/types';

@Component({
  selector: 'app-impersonation-banner',
  template: `
    @if (isImpersonating && currentSession) {
    <div class="bg-amber-500 text-white px-4 py-3 shadow-lg">
      <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-2xl"></i>
          <div class="flex flex-col">
            <span class="font-bold text-sm sm:text-base">
              Impersonation Mode Active
            </span>
            <span class="text-xs">
              Super Admin: {{ currentSession.superAdminEmail }} | 
              Impersonating: {{ currentSession.adminEmail }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="text-xs hidden sm:block">
            Expires: {{ formatDate(currentSession.expiresAt) }}
          </span>
          <p-button 
            label="End Session" 
            icon="pi pi-sign-out"
            size="small"
            severity="danger"
            (onClick)="endImpersonation()"
            [loading]="ending">
          </p-button>
        </div>
      </div>
    </div>
    }
  `,
  standalone: true,
  imports: [CommonModule, ButtonModule]
})
export class ImpersonationBannerComponent implements OnInit {
  isImpersonating : Boolean = false;
  currentSession: CurrentImpersonationDto | null = null;
  ending = false;

  constructor(
    private impersonationService: ImpersonationSessionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkImpersonationStatus();
  }

  checkImpersonationStatus() {
    this.impersonationService.getCurrentImpersonationSession().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.isImpersonating = res.data.isImpersonating;
          this.currentSession = res.data;
        }
      },
      error: () => {
        this.isImpersonating = false;
      }
    });
  }

  endImpersonation() {
    if (!this.currentSession) return;

    this.ending = true;
    this.impersonationService.endImpersonation(this.currentSession.sessionId).subscribe({
      next: () => {
        this.toastr.success('Impersonation session ended', 'Success');
        // Reload to clear impersonation context
        window.location.reload();
      },
      error: (err) => {
        this.ending = false;
        this.toastr.error(err.error?.message || 'Failed to end session', 'Error');
      }
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }
}