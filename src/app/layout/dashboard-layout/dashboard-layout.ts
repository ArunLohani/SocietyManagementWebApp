import { Component } from '@angular/core';
import { Sidebar } from "../../shared/sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { MenuBar } from "../../shared/menubar/menubar";

@Component({
  selector: 'app-dashboard-layout',
  imports: [Sidebar, RouterModule, MenuBar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {

}
