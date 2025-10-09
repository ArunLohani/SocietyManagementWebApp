import { Component } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(private authService : AuthService){}


  getEmail(){
    return this.authService.getEmailFromToken();
  }

}
