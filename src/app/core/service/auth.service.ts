import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LoginRequestData,
  RegisterRequestData,
  JwtPayload,
  ApiResponse,
  AuthSuccessData,
  UserDetails
} from '../../types/types';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private url = `${environment.apiUrl}/auth`;

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.loadToken();
  }

  /* ---------------- TOKEN HANDLING ---------------- */

  private loadToken(): void {
    this.token = this.cookieService.get('access_token') || null;
  }

  getToken(): string | null {
    if (!this.token) {
      this.loadToken();
    }
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAuthenticated$(): Observable<boolean> {
    return this.profileService.getMyProfile().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /* ---------------- USER DETAILS (FROM PROFILE) ---------------- */

  getUser(): UserDetails | null {
    return this.profileService.getUser();
  }

  getEmail(): string | null {
    return this.getUser()?.email ?? null;
  }

  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }

  getRoles(): string[] {
    return this.getUser()?.roles ?? [];
  }

  getTenantId(): number | null {
    return this.getUser()?.tenantId ?? null;
  }

  getSocietyName(): string | null {
    return this.getUser()?.societyName ?? null;
  }

  getIsImpersonating():Boolean {
    return this.getUser()?.isImpersonating ?? false;
  }

  getSessionId() : number | null {
       return this.getUser()?.sessionId ?? null;

  }

  /* ---------------- ROLE HELPERS ---------------- */

  isUserSuperAdmin(): boolean {
    return this.getRoles().includes('SUPER_ADMIN');
  }

  isUserAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  /* ---------------- AUTH ACTIONS ---------------- */

  login(loginData: LoginRequestData): Observable<ApiResponse<AuthSuccessData>> {
    return this.httpClient.post<ApiResponse<AuthSuccessData>>(
      `${this.url}/login`,
      loginData
    );
  }

  register(registerData: RegisterRequestData): Observable<ApiResponse<AuthSuccessData>> {
    return this.httpClient.post<ApiResponse<AuthSuccessData>>(
      `${this.url}/register`,
      registerData
    );
  }

  logout(): Observable<ApiResponse<String>> {
     return this.httpClient.post<ApiResponse<String>>(
      `${this.url}/logout`,
      {}
    );
  }
}
