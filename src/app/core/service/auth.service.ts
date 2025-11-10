import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; // Removed OnInit
import { Observable } from 'rxjs';
import { LoginRequestData, RegisterRequestData, JwtPayload, User, ApiResponse, AuthSuccessData, Role } from '../../types/types';import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token: string | null = null;
  url = `${environment.apiUrl}/auth`;

  constructor(private httpClient: HttpClient, private cookieService: CookieService,private router : Router) {
  }

  getToken() {
    this.token = this.cookieService.get('access_token');
  }
  isAuthenticated(): boolean {
    this.getToken()
    return !!this.token;
  }

  decodeToken(token: string): JwtPayload {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken;
  }

  getEmailFromToken(): string | null {
    if (this.isAuthenticated() && this.token) {
      return this.decodeToken(this.token).email;
    }
    return null;
  }

  getRolesFromToken() : string[] | null {

     if (this.isAuthenticated() && this.token) {
      console.log(this.decodeToken(this.token).roles)
      return this.decodeToken(this.token).roles.split(",");
    }
    return null;

  }

  isUserSuperAdmin () : boolean {
      
    return this.getRolesFromToken()?.includes("SUPER_ADMIN") ? true : false;

  }

  isUserAdmin():boolean{
        return this.getRolesFromToken()?.includes("ADMIN") ? true : false;

  }

  login(loginData: LoginRequestData): Observable<ApiResponse<AuthSuccessData>> {
    return this.httpClient.post<ApiResponse<AuthSuccessData>>(`${this.url}/login`, loginData);
  }

  register(registerData: RegisterRequestData): Observable<ApiResponse<AuthSuccessData>>{
    return this.httpClient.post<ApiResponse<AuthSuccessData>>(`${this.url}/register`, registerData);
  }

  logout() {
     this.cookieService.delete('access_token', '/'); 
    this.router.navigate(['/login']);
  }


}
