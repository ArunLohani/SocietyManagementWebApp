// src/app/features/events/events.component.ts
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
import { DatePickerModule } from 'primeng/datepicker';
import { EventsService } from '../../../core/service/event.service';
import { Event, EventCreationRequest, EventFilter, Page, User } from '../../../types/types';
import { AuthService } from '../../../core/service/auth.service';
import { TenantRoleMenuService } from '../../../core/service/tenant-role-menu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events',
  templateUrl: './event.html',
  styleUrls: ['./event.css'],
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
    CheckboxModule,
    DatePickerModule
  ]
})
export class EventsManagerComponent implements OnInit {
  eventsPage: Page<Event> | null = null;
  loading = false;

  // filters
  filter: EventFilter = {};
  page = 0;
  pageSize = 6;

  statusOptions = [
    { name: 'Any Status', code: '' },
    { name: 'Published', code: 'PUBLISHED' },
    { name: 'Cancelled', code: 'CANCELLED' },
    { name: 'Completed', code: 'COMPLETED' }
  ];

  // create modal
  showCreateModal = false;
  newEvent: Partial<EventCreationRequest> = this.emptyEvent();

  // participants modal
  showParticipantsModal = false;
  selectedEventId: number | null = null;
  selectedEventName = '';
  participants: User[] = [];
  loadingParticipants = false;

  // current user
  currentUserId: number | undefined;

  // permission
  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private eventsService: EventsService,
    private auth: AuthService,
    private router: Router,
      private tenantRoleMenuService: TenantRoleMenuService,
      private toastrService : ToastrService
    ) {
      this.tenantRoleMenuService.getPriority("Events").subscribe({
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
    const tenantId = this.auth.getTenantId() ?? null;
    
    try {
      const idStr = this.auth.getTenantId();
      this.currentUserId = Number(idStr);
    } catch { }
    this.loadEvents(0);
  }

  emptyEvent(): Partial<EventCreationRequest> {
    return {
      name: '',
      description: '',
      location: '',
      startDateTime: new Date(),
      endDateTime: new Date(),
      isPublic: false,
      isExpired: false,
      status: 'PUBLISHED',
      registrationRequired: false,
      maxParticipants: 50,
      organizedBy: 0
    };
  }

  loadEvents(page: number = 0): void {
    this.loading = true;
    this.eventsService.getEventsForMyTenant(page, this.pageSize).subscribe({
      next: (res) => {
        this.eventsPage = res.data;
        this.page = page;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  searchEvents(): void {
    this.loading = true;
    this.eventsService.searchEvents(this.filter, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.eventsPage = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  clearFilters(): void {
    this.filter = {};
    this.loadEvents(0);
  }

  onPageChange(e: PaginatorState) {
    this.loadEvents(e.page);
  }

  toggleCreateModal(): void {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) this.newEvent = this.emptyEvent();
  }

  createEvent(): void {
    if (!this.newEvent.name || !this.newEvent.location || !this.newEvent.startDateTime || !this.newEvent.endDateTime) {
      this.toastrService.error('Please fill required fields');
      return;
    }
    this.newEvent.organizedBy = this.currentUserId;

    if (typeof this.newEvent.startDateTime === 'string') this.newEvent.startDateTime = new Date(this.newEvent.startDateTime);
    if (typeof this.newEvent.endDateTime === 'string') this.newEvent.endDateTime = new Date(this.newEvent.endDateTime);

    this.eventsService.createEvent(this.newEvent as EventCreationRequest).subscribe({
      next: () => {
        this.toggleCreateModal();
        this.loadEvents(this.page);
      },
      error: err => 
           this.toastrService.error('Failed to create event: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  openParticipants(eventId: number, eventName: string) {
    this.selectedEventId = eventId;
    this.selectedEventName = eventName;
    this.showParticipantsModal = true;
    this.loadParticipants(eventId);
  }

  closeParticipants() {
    this.showParticipantsModal = false;
    this.selectedEventId = null;
    this.selectedEventName = '';
    this.participants = [];
  }

  loadParticipants(eventId: number) {
    this.loadingParticipants = true;
    this.participants = [];
    this.eventsService.getAllParticipants(eventId).subscribe({
      next: res => {
        this.participants = res.data;
        this.loadingParticipants = false;
      },
      error: () => this.loadingParticipants = false
    });
  }

  removeParticipant(eventId: number, userId: number) {
    this.eventsService.removeParticipant(eventId, userId).subscribe({
      next: () => this.loadParticipants(eventId),
      error: err =>  this.toastrService.error('Failed to remove participant: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  goToEvent(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }

  getStatusSeverity(status: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    const severities: any = {
      'PUBLISHED': 'success',
      'CANCELLED': 'warn',
      'COMPLETED': 'danger'
    };
    return severities[status] || 'contrast';
  }
}