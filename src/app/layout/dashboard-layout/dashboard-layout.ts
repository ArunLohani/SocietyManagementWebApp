import { Component } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-dashboard-layout',
  imports: [Sidebar, RouterModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {

}
