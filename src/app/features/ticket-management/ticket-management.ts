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
import { ToastrService } from 'ngx-toastr';
import {
  SupportTicket as SupportTicketType,
  SupportTicketFilter,
  TicketRaiseRequest,
  Page,
  TicketStatus
} from '../../types/types';
import { SupportTicket as SupportTicketService } from '../../core/service/support-ticket';
import { ImpersonationSessionService } from '../../core/service/impersonation-session';
import { AuthService } from '../../core/service/auth.service';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-support-tickets',
  templateUrl: './ticket-management.html',
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
    TextareaModule,
    DatePickerModule
  ]
})
export class SupportTicketsComponent implements OnInit {
  activeTab = 0;
  isSuperAdmin = false;
  isAdmin = false;
  currentUserId: number | null = null;

  // Ticket data
  myTicketsPage: Page<SupportTicketType> | null = null;
  allTicketsPage: Page<SupportTicketType> | null = null;
  loading = false;

  // Filters
  myTicketsFilter: SupportTicketFilter = {};
  allTicketsFilter: SupportTicketFilter = {};
  myTicketsPageNum = 0;
  allTicketsPageNum = 0;
  pageSize = 8;

  // Create ticket modal
  showCreateModal = false;
  ticketForm: TicketRaiseRequest = {
    title: '',
    description: ''
  };

  // View ticket modal
  showViewModal = false;
  selectedTicket: SupportTicketType | null = null;
  updatedTicketStatus: string = this.selectedTicket?.status.toString() || "OPEN";

  // Impersonation modal
  showImpersonationModal = false;
  impersonationUntil: Date | null = null;
  processingImpersonation = false;
  minDate = new Date()
  // Status options
  statusOptions = [
    { name: 'Open', code: 'OPEN' },
    { name: 'In Progress', code: 'IN_PROGRESS' },
    { name: 'Closed', code: 'CLOSED' }
  ];

  constructor(
    private ticketService: SupportTicketService,
    private impersonationService: ImpersonationSessionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.isSuperAdmin = this.authService.isUserSuperAdmin();
    this.isAdmin = this.authService.isUserAdmin();
    this.currentUserId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadMyTickets(0);
    if (this.isSuperAdmin) {
      this.loadAllTickets(0);
    }
    this.activeTab = this.isSuperAdmin ? 1 : 0;
  }

  loadMyTickets(page: number = 0) {

    console.log("TICKETS", "1")
    if (!this.currentUserId) return;

    console.log("TICKETS", "2")
    this.loading = true;
    this.myTicketsFilter.raisedBy = this.currentUserId;

    this.ticketService.getTicketsPaginated(this.myTicketsFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.myTicketsPage = res;
        this.myTicketsPageNum = page;
        this.loading = false;

        console.log("TICKETS", this.myTicketsPage)
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load your tickets', 'Error');
      }
    });
  }

  loadAllTickets(page: number = 0) {
    this.loading = true;

    this.ticketService.getTicketsPaginated(this.allTicketsFilter, page, this.pageSize).subscribe({
      next: (res) => {
        this.allTicketsPage = res;
        this.allTicketsPageNum = page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Failed to load tickets', 'Error');
      }
    });
  }

  onMyTicketsPageChange(e: PaginatorState) {
    this.loadMyTickets(e.page);
  }

  onAllTicketsPageChange(e: PaginatorState) {
    this.loadAllTickets(e.page);
  }

  applyMyTicketsFilters() {
    this.loadMyTickets(0);
  }

  clearMyTicketsFilters() {
    this.myTicketsFilter = { raisedBy: this.currentUserId! };
    this.loadMyTickets(0);
  }

  applyAllTicketsFilters() {
    this.loadAllTickets(0);
  }

  clearAllTicketsFilters() {
    this.allTicketsFilter = {};
    this.loadAllTickets(0);
  }

  openCreateModal() {
    this.ticketForm = { title: '', description: '' };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.ticketForm = { title: '', description: '' };
  }

  raiseTicket() {
    if (!this.ticketForm.title || !this.ticketForm.description) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.ticketService.raiseTicket(this.ticketForm).subscribe({
      next: () => {
        this.toastr.success('Ticket raised successfully', 'Success');
        this.closeCreateModal();
        this.loadMyTickets(this.myTicketsPageNum);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to raise ticket', 'Error');
      }
    });
  }

  openViewModal(ticket: SupportTicketType) {
    this.selectedTicket = ticket;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedTicket = null;
  }

  updateTicketStatus(ticketId: number) {
    this.ticketService.updateTicketStatus(ticketId, this.updatedTicketStatus).subscribe({
      next: () => {
        this.toastr.success('Ticket status updated', 'Success');
        this.loadMyTickets(this.myTicketsPageNum);
        if (this.isSuperAdmin) {
          this.loadAllTickets(this.allTicketsPageNum);
        }
        this.closeViewModal();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update status', 'Error');
      }
    });
  }

  openImpersonationModal(ticket: SupportTicketType) {
    this.selectedTicket = ticket;
    this.impersonationUntil = new Date();
    this.impersonationUntil.setHours(this.impersonationUntil.getHours() + 24);
    this.showImpersonationModal = true;
  }

  closeImpersonationModal() {
    this.showImpersonationModal = false;
    this.selectedTicket = null;
    this.impersonationUntil = null;
  }

  allowImpersonation() {
    if (!this.selectedTicket) return;

    this.processingImpersonation = true;
    this.ticketService.updateImpersonationStatus(this.selectedTicket.id,true).subscribe({
      next: () => {
        this.toastr.success('Impersonation allowed for this ticket', 'Success');
        this.closeImpersonationModal();
        this.loadAllTickets(this.allTicketsPageNum);
      },
      error: (err) => {
        this.processingImpersonation = false;
        this.toastr.error(err.error?.message || 'Failed to allow impersonation', 'Error');
      }
    });
  }

  startImpersonation(ticketId: number) {
    this.processingImpersonation = true;
    this.impersonationService.startImpersonation(ticketId).subscribe({
      next: (res) => {
        this.toastr.success('Impersonation session started successfully', 'Success');
        this.processingImpersonation = false;
        // Reload the page to apply impersonation context
        window.location.href = '/';

      },
      error: (err) => {
        this.processingImpersonation = false;
        this.toastr.error(err.error?.message || 'Failed to start impersonation', 'Error');
      }
    });
  }

  revokeImpersonation(ticketId: number) {
    this.ticketService.updateImpersonationStatus(ticketId,false).subscribe({
      next: () => {
        this.toastr.success('Impersonation access revoked', 'Success');
        this.loadAllTickets(this.allTicketsPageNum);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to revoke impersonation', 'Error');
      }
    });
  }

  getStatusSeverity(status: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" | null | undefined {
    const severityMap: any = {
      'OPEN': 'info',
      'IN_PROGRESS': 'warn',
      'CLOSED': 'success'
    };
    return severityMap[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const labelMap: any = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'CLOSED': 'Closed'
    };
    return labelMap[status] || status;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }
}