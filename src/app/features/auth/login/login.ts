
import { Component, HostListener } from '@angular/core';
import { AuthLayout } from '../../../layout/auth-layout/auth-layout';
import { LoginRequestData } from '../../../types/types';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/service/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [AuthLayout, FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  showPassword: boolean = false;
  isMobile: boolean = false;

  eyeIcon = faEye;
  eyeClosedIcon = faEyeSlash;
  googleIcon = faGoogle;

  loginData: LoginRequestData = {
    email: "",
    password: ""
  };

  errorMessage = '';

  constructor(
    private service: AuthService,
    private router: Router,
    private toaster: ToastrService,
    private cookieService: CookieService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 640;
    }
  }

  onRegisterClick = () => {
    this.router.navigateByUrl("/register");
  }

  togglePassword = () => {
    this.showPassword = !this.showPassword;
  }

  onLogin = (formData: any) => {
    this.service.login(this.loginData).subscribe({
      next: (res) => {
        console.log(res);
        this.toaster.success('Login Successful');
        console.log(this.cookieService.get('access_token'));
        this.router.navigateByUrl("/");
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.toaster.error(err.error.message);
      }
    });
  }

  ContinueWithGoogle() {
    window.location.href = "http://localhost:8081/api/v1/oauth2/authorization/google";
  }
}