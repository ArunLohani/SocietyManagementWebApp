import { Component } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { MenuBar } from "../../shared/menubar/menubar";
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-dashboard-layout',
  imports: [Sidebar, RouterModule, MenuBar,FontAwesomeModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
mobileOpen = false;
menuIcon = faBars
}
