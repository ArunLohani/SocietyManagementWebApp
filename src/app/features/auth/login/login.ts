import { Component } from '@angular/core';
import { AuthLayout } from '../../../layout/auth-layout/auth-layout';
import { LoginRequestData } from '../../../types/types';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/service/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import { faGoogle} from '@fortawesome/free-brands-svg-icons';
import { Router } from '@angular/router';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-login',
  imports: [AuthLayout, FormsModule, CommonModule,FontAwesomeModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  constructor(private service: AuthService , private router : Router , private toaster : ToastrService,private cookieService:CookieService) { }

  showPassword : boolean = false;

  eyeIcon = faEye
  eyeClosedIcon = faEyeSlash
googleIcon = faGoogle
  onRegisterClick = ()=>{
    this.router.navigateByUrl("/register")
  }

  togglePassword = ()=>{
    this.showPassword = !this.showPassword;
  }

  loginData: LoginRequestData = {
    email: "",
    password: ""
  }
  errorMessage = ''
  onLogin = (formData: any) => {
    this.service.login(this.loginData).subscribe({
      next: (res) => {
        console.log(res);
    this.toaster.success('Login Successfull');
    console.log(this.cookieService.get('access_token'))
     this.router.navigateByUrl("/")
  
      }, error: (err) => {
        this.errorMessage = err.error.message
         this.toaster.error(err.error.message);
      }
    })
    // console.log("form data",formData.value);
    // console.log(this.loginData.email);
    // console.log(this.loginData.password);


  }

 ContinueWithGoogle() {
  window.location.href = "http://localhost:8081/api/v1/oauth2/authorization/google";
}

}
