import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import {
  User,
  LoginRequest,
  ApiResponse,
} from '../../models';

// Response now only contains the token
interface LoginResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usersApiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Load user from storage on init
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (this.storageService.isLoggedIn()) {
      const user = this.storageService.getUser();
      if (user) {
        this.currentUserSubject.next(user as User);
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        switchMap((response) => {
          if (response.success && response.data?.accessToken) {
            // Store token
            this.storageService.setToken(response.data.accessToken);
            
            // Decode token to get userId
            const decoded = this.storageService.decodeToken();
            const userId = decoded?.sub;
            
            if (userId) {
              // Fetch full user details from backend
              return this.http.get<ApiResponse<User>>(`${this.usersApiUrl}/${userId}`).pipe(
                tap((userResponse) => {
                  if (userResponse.success && userResponse.data) {
                    // Store user data (without id and role - those come from token)
                    const { id, role, ...userData } = userResponse.data as any;
                    this.storageService.setUserData(userData);
                    
                    // Set complete user (with id and role from token)
                    const completeUser = this.storageService.getUser();
                    if (completeUser) {
                      this.currentUserSubject.next(completeUser as User);
                    }
                  }
                }),
                switchMap(() => [response])
              );
            }
          }
          return [response];
        })
      );
  }

  logout(): void {
    this.storageService.clearAuth();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    if (this.storageService.isLoggedIn()) {
      return this.storageService.getUser() as User;
    }
    return null;
  }

  updateCurrentUser(user: User): void {
    // Update stored user data
    const { id, role, ...userData } = user as any;
    this.storageService.setUserData(userData);
    this.currentUserSubject.next(user);
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole(['ADMIN']);
  }

  isManager(): boolean {
    return this.hasRole(['ADMIN', 'PROJECT_MANAGER']);
  }
}
