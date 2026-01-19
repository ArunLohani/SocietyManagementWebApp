// src/app/features/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { EventsService } from '../../../../core/service/event.service';
import { Event, EventCreationRequest, User } from '../../../../types/types';
import { AuthService } from '../../../../core/service/auth.service';
import { TenantRoleMenuService } from '../../../../core/service/tenant-role-menu.service';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css'],
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
  DatePickerModule,
    CheckboxModule,

  ]
})
export class EventDetailComponent implements OnInit {
  eventId!: number;
  event: Event | null = null;
  loading = false;
  loadingParticipants = false;
  participants: User[] = [];

  // edit mode
  editMode = false;
  editModel: Partial<Event> = {};

  currentUserId: number | null = null;
  isUserParticipant: boolean | null = null;

  permission: "READ" | "EDIT" | "CREATE" = "READ";

  constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private auth: AuthService,
    private router: Router,
    private tenantRoleMenuService: TenantRoleMenuService,
    private toastrService : ToastrService
  ) {
    this.tenantRoleMenuService.getPriority("Events").subscribe({
      next: (res) => {
        this.permission = res.data === 10 ? "READ" : res.data === 20 ? "EDIT" : res.data === 30 ? "CREATE" : "READ";
      },
      error: (err) => {
        this.permission = "READ";
      },
    });
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUserId = this.auth.getUserId();
    this.loadEvent();
    this.checkParticipation();
    this.loadParticipants();
  }

  loadEvent() {
    this.loading = true;
    this.eventsService.getEventById(this.eventId).subscribe({
      next: res => {
        this.event = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  enterEdit() {
    if (!this.event) return;
    this.editMode = true;
    this.editModel = { ...this.event };
    // Convert dates for calendar component
    if (this.editModel.startDateTime) {
      this.editModel.startDateTime = new Date(this.editModel.startDateTime);
    }
    if (this.editModel.endDateTime) {
      this.editModel.endDateTime = new Date(this.editModel.endDateTime);
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editModel = {};
  }

  saveEdit() {
    if (!this.event) return;
    const payload: any = {
      name: this.editModel.name || this.event.name,
      description: this.editModel.description || this.event.description,
      location: this.editModel.location || this.event.location,
      startDateTime: this.editModel.startDateTime || this.event.startDateTime,
      endDateTime: this.editModel.endDateTime || this.event.endDateTime,
      isPublic: this.editModel.isPublic ?? this.event.isPublic,
      isExpired: this.editModel.isExpired ?? this.event.isExpired,
      status: this.editModel.status ?? this.event.status,
      organizedBy: (this.event.organizedBy as any)?.id ?? (this.event.organizedBy as any) ?? this.currentUserId,
      registrationRequired: this.editModel.registrationRequired ?? this.event.registrationRequired,
      maxParticipants: this.editModel.maxParticipants ?? this.event.maxParticipants
    } as EventCreationRequest;

    this.eventsService.updateEvent?.(this.eventId, payload).subscribe({
      next: () => {
        this.editMode = false;
        this.loadEvent();
      },
      error: (err: any) =>  this.toastrService.error('Failed to update event: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  checkParticipation() {
    if (!this.currentUserId || !this.eventId) return;
    this.eventsService.isUserParticipant(this.currentUserId, this.eventId).subscribe({
      next: res => this.isUserParticipant = res.data,
      error: () => this.isUserParticipant = null
    });
  }

  loadParticipants() {
    this.loadingParticipants = true;
    this.participants = [];
    this.eventsService.getAllParticipants(this.eventId).subscribe({
      next: res => {
        this.participants = res.data;
        this.loadingParticipants = false;
      },
      error: () => this.loadingParticipants = false
    });
  }

  joinLeave() {
    if (this.isUserParticipant) {
      this.eventsService.removeParticipation(this.eventId).subscribe({
        next: () => {
          this.checkParticipation();
          this.loadParticipants();
        },
        error: err =>   this.toastrService.error('Failed to remove participation from event: ' + (err.error?.message || err.message || 'Failed'))
      });
    } else {
      this.eventsService.takeParticipation(this.eventId).subscribe({
        next: () => {
          this.checkParticipation();
          this.loadParticipants();
        },
        error: err =>   this.toastrService.error('Failed to take participation in event: ' + (err.error?.message || err.message || 'Failed'))
      });
    }
  }

  markStatus(status: 'PUBLISHED' | 'CANCELLED' | 'COMPLETED') {
    const payload: any = { ...this.event, status };
    this.eventsService.updateEvent?.(this.eventId, payload).subscribe({
      next: () => this.loadEvent(),
      error: (err: any) =>   this.toastrService.error('Failed to update event status: ' + (err.error?.message || err.message || 'Unknown'))
    });
  }

  showParticipants(): User[] {
    return this.participants;
  }

  backToList() {
    this.router.navigate(['/events']);
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    const severities: any = {
      'PUBLISHED': 'success',
      'CANCELLED': 'warn',
      'COMPLETED': 'danger'
    };
    return severities[status] || 'contrast';
  }
}