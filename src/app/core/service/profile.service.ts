import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, UserDetails } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private url = `${environment.apiUrl}/profile/me`;

  private userSubject = new BehaviorSubject<UserDetails | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  /** Fetch profile from API and cache it */
  getMyProfile(): Observable<ApiResponse<UserDetails>> {
    return this.httpClient.get<ApiResponse<UserDetails>>(this.url).pipe(
      tap(res => this.userSubject.next(res.data))
    );
  }

  /** Synchronous access (used in AuthService & UI) */
  getUser(): UserDetails | null {
    return this.userSubject.value;
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
