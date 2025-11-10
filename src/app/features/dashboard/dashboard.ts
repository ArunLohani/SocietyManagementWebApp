import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { UserRoleManager } from "../user-role-manager/user-role-manager";
import { UserRolePermissionManager } from "../user-role-permission-manager/user-role-permission-manager";
import { SocietyRoleManager } from "../society-role-manager/society-role-manager";
import { SuperAdminSocietyManager } from '../super-admin-society-manager/super-admin-society-manager.component';
import { DashboardLayout } from "../../layout/dashboard-layout/dashboard-layout";
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardLayout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  tenancyStatus : boolean = false;
  loading : boolean = false;
  constructor(private userService : UserService){
  this.checkTenancyStatus()
  
  }

  checkTenancyStatus (){
    this.loading = true;

      this.userService.checkTenancyStatus().subscribe({next : (response) => {
        console.log(response.data)
          this.tenancyStatus = response.data;
          this.loading = false

    },error : (err)=> {
        this.loading = false;
    },})

  }
 

}
