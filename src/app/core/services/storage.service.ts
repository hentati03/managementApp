import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  // Token management
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Decode JWT token
  decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // JWT structure: header.payload.signature
      const payload = token.split('.')[1];
      // Decode base64
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Store user data (firstName, lastName, avatar, etc. - NOT id or role)
  setUserData(userData: any): void {
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  // Get stored user data
  getUserData(): any | null {
    try {
      const data = localStorage.getItem(USER_DATA_KEY);
      if (!data || data === 'undefined' || data === 'null') {
        return null;
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Get complete user (merge token data with stored data)
  getUser(): any | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    const userData = this.getUserData();
    if (!userData) return null;

    // Combine: id and role from token, other data from localStorage
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      ...userData, // firstName, lastName, avatar, bio, etc.
    };
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  }

  // Clear auth data
  clearAuth(): void {
    this.removeToken();
    localStorage.removeItem(USER_DATA_KEY);
  }

  // Check if user is logged in (has valid token)
  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }
}
