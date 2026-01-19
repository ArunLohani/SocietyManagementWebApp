import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBuilding,
  faChevronRight,
  faPowerOff,
  faUser,
  faUsersCog,
  faKey,
  faUsers,
  faChartLine,
  faBars,
  faXmark,
  faTicket,
  faUserSecret
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../app/core/service/auth.service';
import { MenuService } from '../../core/service/menu.service';
import { ImpersonationSessionService } from '../../core/service/impersonation-session';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {

  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  showMenu = false;

  // Icons
  power_off = faPowerOff;
  society = faBuilding;
  roleIcon = faUsersCog;
  permissionIcon = faKey;
  usersIcon = faUsers;
  dashboardIcon = faChartLine;
  menuIcon = faBars;
  closeIcon = faXmark;
  ticketIcon = faTicket
  sessionIcon = faUserSecret
  menuItems: Menu[] = [];

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private router : Router,
    private impersonationService : ImpersonationSessionService
  ) {

   if(!authService.isUserSuperAdmin()){
     // Dynamic Menu
    const userMenus: Menu = {
      label: 'Menus',
      route: '#',
      icon: this.menuIcon,
      toggleIcon: this.closeIcon,
      children: []
    };

    this.menuService.getAllMenus().subscribe({
      next: (res) => {
        res.data.forEach(menu => {
          userMenus.children?.push({
            label: menu.menuName,
            route: menu.menuName == "Dashboard" ? "" : `/${menu.menuName.toLowerCase().replaceAll(' ', '_')}`,
            icon: null
          });
        });
        this.menuItems.push(userMenus);
      }
    });
   }

    if (authService.isUserSuperAdmin()) {
      this.menuItems.push({
        label: 'Society Management',
        route: '/super_admin/society',
        icon: this.society,
      },
      {
          label: 'Ticket Management',
          route: '/super_admin/ticket',
          icon: this.ticketIcon,
        });
    }

    if (authService.isUserAdmin()) {
      this.menuItems.push(
        {
          label: 'Role Management',
          route: '/admin/role',
          icon: this.roleIcon,
        },
        {
          label: 'User Management',
          route: '/admin/user',
          icon: this.usersIcon,
        },
        {
          label: 'Permission Management',
          route: '/admin/permission',
          icon: this.permissionIcon,
        },
      {
          label: 'Ticket Management',
          route: '/admin/ticket',
          icon: this.ticketIcon,
        },
         {
          label: 'Session Management',
          route: '/admin/session',
          icon: this.sessionIcon,
        }
      );
    }
  }

  isImpersonating (){
    return this.authService.getIsImpersonating();
  }


  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  closeOnMobile() {
    this.closeMobile.emit();
  }

  endImpersonation(){
    const sessionId = this.authService.getSessionId();
    if(!sessionId) return;
     this.impersonationService.endImpersonation(sessionId)
    .subscribe({
      next: () => {
      window.location.href = '/';
      },
      error: (err) => {
        console.error('Failed to exit impersonation', err);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next : (res)=>{
        this.router.navigateByUrl("/login")
      }
    });
  }
}

type Menu = {
  label: string;
  route: string;
  icon: any;
  toggleIcon?: any;
  children?: Menu[];
};