import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LoginRequestData,
  RegisterRequestData,
  JwtPayload,
  ApiResponse,
  AuthSuccessData
} from '../../types/types';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment.development';
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

  /* ---------------- AUTH CHECKS ---------------- */

  /** ✅ Sync check (used for token decoding & UI logic) */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** ✅ API-level auth check (used in Guards) */
  isAuthenticated$(): Observable<boolean> {
    return this.profileService.getMyProfile().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /* ---------------- TOKEN DECODING ---------------- */

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getEmailFromToken(): string | null {
    return this.decodeToken()?.email ?? null;
  }

  getUserIdFromToken(): number | null {
    const sub = this.decodeToken()?.sub;
    return sub ? Number(sub) : null;
  }

  getRolesFromToken(): string[] {
    return this.decodeToken()?.roles?.split(',') ?? [];
  }

  getTenantIdFromToken(): number | null {
    return this.decodeToken()?.tenantId ?? null;
  }

  /* ---------------- ROLE HELPERS ---------------- */

  isUserSuperAdmin(): boolean {
    return this.getRolesFromToken().includes('SUPER_ADMIN');
  }

  isUserAdmin(): boolean {
    return this.getRolesFromToken().includes('ADMIN');
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

  logout(): void {
    this.cookieService.delete('access_token', '/');
    this.token = null;
    this.router.navigate(['/login']);
  }
}
