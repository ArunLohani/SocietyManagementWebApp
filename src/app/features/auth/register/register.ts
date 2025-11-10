import { Component } from '@angular/core';
import { AuthLayout } from '../../../layout/auth-layout/auth-layout';
import { LoginRequestData, RegisterRequestData } from '../../../types/types';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/service/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-register',
  imports: [AuthLayout, FormsModule, CommonModule,FontAwesomeModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  constructor(private service: AuthService , private router : Router, private toaster : ToastrService,private cookieService:CookieService) { }
  step = 1;
  showPassword : boolean = false;
  showCPassword : boolean = false;
  eyeIcon = faEye
  eyeClosedIcon = faEyeSlash
  backBtn = faArrowLeft
  googleIcon = faGoogle
  togglePassword = ()=>{
    this.showPassword = !this.showPassword;
  }
  toggleCPassword = ()=>{
    this.showCPassword = !this.showCPassword;
  }

  registerData: RegisterRequestData = {
    email: "",
    password: "",
    name:"",
    phoneNumber:"",
    roles : []
  }

 handleRoleClick(role:string){
  this.registerData.roles.pop()
  this.registerData.roles.push(role)
  console.log(this.registerData.roles);
  
 }

  confirmPassword = ""

  onNextStep = ()=>{

    if(this.step === 1){
      this.step+=1;
    }
   
  }

  onBack = ()=>{

    if(this.step===2){
       this.step-=1;
    }

  }

  errorMessage = ''
  onRegister = (formData: any) => {``

    if(this.registerData.password != this.confirmPassword){
      this.errorMessage = "Passwords do not match."
      return;
    }

    this.service.register(this.registerData).subscribe({
      next: (res) => {
        console.log(res);
    this.toaster.success('Registered Successfully');
    console.log(this.cookieService.get('access_token'))
     this.router.navigateByUrl("/")
  
      }, error: (err) => {
        this.errorMessage = err.error.message
         this.toaster.error(err.error.message);
      }
    })
 

  }
 ContinueWithGoogle() {
  window.location.href = "http://localhost:8081/api/v1/oauth2/authorization/google";
}

  onLoginClick(){
    this.router.navigateByUrl("/login")
  }


}
