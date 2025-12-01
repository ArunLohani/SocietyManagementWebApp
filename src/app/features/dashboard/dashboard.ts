import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
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
