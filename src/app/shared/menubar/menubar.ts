import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// PrimeNG Imports
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';

// Services and Types
import { AuthService } from '../../core/service/auth.service';
import { ProfileService } from '../../core/service/profile.service';
import { StompService } from '../../core/service/stomp.service';
import { UserDetails, Notification } from '../../types/types';
import { NotificationService } from '../../core/service/notification.service';
import { EventEmitter,Output } from '@angular/core';
import {ImpersonationSessionService } from '../../core/service/impersonation-session';
@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    ButtonModule,
    PopoverModule,
    RippleModule,
    DividerModule,
    TabsModule,
    ScrollPanelModule,
    TooltipModule
  ],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css'
})
export class MenuBar implements OnInit, OnDestroy {

  @Output() toggleSidebar = new EventEmitter<void>();

  user: UserDetails | null = null;
  menuItems: MenuItem[] = [];
  
  societyNotifications: Notification[] = [];
  userNotifications: Notification[] = [];
  
  get totalNotificationCount(): number {
    return this.unreadSocietyCount + this.unreadUserCount;
  }
  
  get unreadSocietyCount(): number {
    return this.societyNotifications.filter(n => !n.read).length;
  }
  
  get unreadUserCount(): number {
    return this.userNotifications.filter(n => !n.read).length;
  }
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private stompService: StompService,
    private router: Router,
    private notificationService: NotificationService,
    private impersonationService : ImpersonationSessionService
  ) {}

  openSidebar(){
    this.toggleSidebar.emit()
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupNotificationSubscriptions();
    this.loadDatabaseNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stompService.disconnect();
  }

private loadUserProfile(): void {
  this.profileService.getMyProfile()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        console.log('User profile loaded:', res.data);
        this.user = res.data;

        // ✅ Use UserDetails directly
        const userId = this.user.id;
        const tenantId = this.user.tenantId;

        /* ---------------- USER NOTIFICATIONS ---------------- */
        if (userId) {
          console.log('Subscribing to notifications for user:', userId);
          this.stompService.subscribeToUserNotifications(userId);
        }

        /* ---------------- SOCIETY NOTIFICATIONS ---------------- */
        if (tenantId) {
          console.log('Subscribing to society notifications:', tenantId);
          this.stompService.subscribeToSocietyNotifications(tenantId);
        }
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
      }
    });
}

  private loadDatabaseNotifications(): void {
    forkJoin({
      userNotifications: this.notificationService.getUserNotification(),
      societyNotifications: this.notificationService.getSocietyNotification()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        // Load user notifications from DB
        if (result.userNotifications.data) {
          const dbUserNotifications = result.userNotifications.data.map(n => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
          }));
          
          // Merge with existing WebSocket notifications
          const existingIds = new Set(this.userNotifications.map(n => n.id));
          const newNotifications = dbUserNotifications.filter(n => !existingIds.has(n.id));
          this.userNotifications = [...dbUserNotifications, ...this.userNotifications.filter(n => !n.id)];
        }

        // Load society notifications from DB
        if (result.societyNotifications.data) {
          const dbSocietyNotifications = result.societyNotifications.data.map(n => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
          }));
          
          // Merge with existing WebSocket notifications
          const existingIds = new Set(this.societyNotifications.map(n => n.id));
          const newNotifications = dbSocietyNotifications.filter(n => !existingIds.has(n.id));
          this.societyNotifications = [...dbSocietyNotifications, ...this.societyNotifications.filter(n => !n.id)];
        }
      },
      error: (err) => {
        console.error('Failed to load database notifications:', err);
      }
    });
  }

  private setupNotificationSubscriptions(): void {
    // Subscribe to user notifications stream
    this.stompService.userNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          console.log("User notifications updated:", notifications);
          
          // Add new WebSocket notifications to the list
          const newNotifications = notifications.map(n => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            read: n.read || false
          }));
          
          // Merge with existing notifications, avoiding duplicates by ID
          const existingIds = new Set(this.userNotifications.map(n => n.id).filter(id => id));
          const uniqueNew = newNotifications.filter(n => !n.id || !existingIds.has(n.id));
          
          if (uniqueNew.length > 0) {
            this.userNotifications = [...uniqueNew, ...this.userNotifications];
          }
        },
        error: (err) => {
          console.error('Error in user notifications stream:', err);
        }
      });

    // Subscribe to society notifications stream
    this.stompService.societyNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          console.log("Society notifications updated:", notifications);
          
          // Add new WebSocket notifications to the list
          const newNotifications = notifications.map(n => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            read: n.read || false
          }));
          
          // Merge with existing notifications, avoiding duplicates by ID
          const existingIds = new Set(this.societyNotifications.map(n => n.id).filter(id => id));
          const uniqueNew = newNotifications.filter(n => !n.id || !existingIds.has(n.id));
          
          if (uniqueNew.length > 0) {
            this.societyNotifications = [...uniqueNew, ...this.societyNotifications];
          }
        },
        error: (err) => {
          console.error('Error in society notifications stream:', err);
        }
      });
  }

  /**
   * Mark notification as read only (without navigation)
   * Used by the mark-as-read icon button
   */
  markAsReadOnly(notification: Notification, type: 'society' | 'user', event: Event): void {
    // Stop event propagation to prevent triggering the notification click
    event.stopPropagation();
    
    notification.read = true;
    console.log(notification.id, "marking as read only");
    
    if (notification.id) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (value) => {
          console.log('Notification marked as read');
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
          // Revert the read status on error
          notification.read = false;
        }
      });
    }
  }

  /**
   * Handle notification click - marks as read AND navigates to URL
   * Used when clicking on the notification body
   */
  onNotificationClick(notification: Notification, type: 'society' | 'user'): void {
    // Mark as read
    notification.read = true;
    console.log(notification.id, "notification clicked");
    
    if (notification.id) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (value) => {
          console.log('Notification marked as read');
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
        }
      });
    }

    // Navigate to URL if present
    if (notification.url) {
      this.router.navigateByUrl(notification.url);
    }
  }

  clearAllNotifications(type: 'society' | 'user'): void {
    if (type === 'society') {
      // Mark all unread society notifications as read
      const unreadNotifications = this.societyNotifications.filter(n => !n.read && n.id);
      console.log("unreadNotifications",unreadNotifications)
      if (unreadNotifications.length > 0) {
        // Mark all as read in the UI immediately
        this.societyNotifications.forEach(n => n.read = true);
        
        // Make API calls to mark each as read
        unreadNotifications.forEach(notification => {
          if (notification.id) {
            this.notificationService.markAsRead(notification.id).subscribe({
              next: () => {
                console.log(`Society notification ${notification.id} marked as read`);
              },
              error: (err) => {
                console.error(`Failed to mark society notification ${notification.id} as read:`, err);
              }
            });
          }
        });
      }
      
      this.stompService.clearSocietyNotifications();
    } else {
      // Mark all unread user notifications as read
      const unreadNotifications = this.userNotifications.filter(n => !n.read && n.id);
      
      if (unreadNotifications.length > 0) {
        // Mark all as read in the UI immediately
        this.userNotifications.forEach(n => n.read = true);
        
        // Make API calls to mark each as read
        unreadNotifications.forEach(notification => {
          if (notification.id) {
            this.notificationService.markAsRead(notification.id).subscribe({
              next: () => {
                console.log(`User notification ${notification.id} marked as read`);
              },
              error: (err) => {
                console.error(`Failed to mark user notification ${notification.id} as read:`, err);
              }
            });
          }
        });
      }
      
      this.stompService.clearUserNotifications();
    }
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return this.user.name[0].toUpperCase();
  }

  getTimeAgo(date?: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

 exitImpersonation(): void {
  if (!this.user?.impersonationSessionId) return;

  this.impersonationService.endImpersonation(this.user.impersonationSessionId)
    .subscribe({
      next: () => {
       window.location.href = '/';

      },
      error: (err) => {
        console.error('Failed to exit impersonation', err);
      }
    });
}

}