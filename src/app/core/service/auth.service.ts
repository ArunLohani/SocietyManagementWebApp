import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; // Removed OnInit
import { Observable } from 'rxjs';
import { LoginRequestData, AuthResponse, RegisterRequestData, JwtPayload } from '../../types/types';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token: string | null = null;
  url = `${environment.apiUrl}/auth`;

  constructor(private httpClient: HttpClient, private cookieService: CookieService) {
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

  login(loginData: LoginRequestData): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.url}/login`, loginData);
  }

  register(registerData: RegisterRequestData): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.url}/register`, registerData);
  }
}
