import { Component, Input } from '@angular/core';
import { AuthService } from '../../../app/core/service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faPowerOff,
  faUser,
  faUsersCog,
  faKey,
  faUsers,
  faChartLine,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { MenuService } from '../../core/service/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  // Sidebar state
  collapsed = false;

  // Icons
  chevron_right = faChevronRight;
  chevron_left = faChevronLeft;
  power_off = faPowerOff;
  userIcon = faUser;
  society = faBuilding;
  roleIcon = faUsersCog;
  permissionIcon = faKey;
  usersIcon = faUsers;
  dashboardIcon = faChartLine
  menuIcon = faBars

  menuItems: Array<Menu> = [];

  constructor(private authService: AuthService,private menuService : MenuService) {

    const userMenus : Menu = {
      label : "Menus",
      route : "#",
      icon : this.menuIcon,
      children : []

    }
    this.menuItems.push({
      label: 'Overview',
      route: '/',
      icon: this.dashboardIcon,
    })
    this.menuService.getAllMenus().subscribe({next : (response)=> {
          response.data.map(menu => 
            userMenus.children?.push({
              label : menu.menuName,
              route : `/${menu.menuName.toLowerCase().split(" ").join("_")}`,
              icon :""
            })
          )

          this.menuItems.push(userMenus);

            console.log(this.menuItems);
    },})

    if (authService.isUserSuperAdmin()) {
      this.menuItems.push({
        label: 'Society Management',
        route: '/s_admin/society',
        icon: this.society,
      });
    }

    if (authService.isUserAdmin()) {
      this.menuItems.push({
        label: 'Role Management',
        route: '/admin/role',
        icon: this.roleIcon,
      });
      this.menuItems.push({
        label: 'User Management',
        route: '/admin/user',
        icon: this.usersIcon,
      });
      this.menuItems.push({
        label: 'Permission Management',
        route: '/admin/permission',
        icon: this.permissionIcon,
      });
    }
  }


  

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.authService.logout();
  }

  user: User = { name: '', role: '', picture: '', email: '' };
}

type User = {
  name: string;
  role: string;
  email: string;
  picture: string;
};

type Menu = {
  label: string;
  route: string;
  icon: any;
  children? : Menu[]
};
