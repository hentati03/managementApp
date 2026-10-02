import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DashboardStats, ProjectAnalytics, UserWorkload } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`);
  }

  getProjectAnalytics(projectId: string): Observable<ApiResponse<ProjectAnalytics>> {
    return this.http.get<ApiResponse<ProjectAnalytics>>(`${this.apiUrl}/projects/${projectId}`);
  }

  getUserWorkload(userId?: string): Observable<ApiResponse<UserWorkload[]>> {
    const url = userId
      ? `${this.apiUrl}/workload/${userId}`
      : `${this.apiUrl}/workload`;
    return this.http.get<ApiResponse<UserWorkload[]>>(url);
  }

  getTeamWorkload(): Observable<ApiResponse<UserWorkload[]>> {
    return this.http.get<ApiResponse<UserWorkload[]>>(`${this.apiUrl}/team-workload`);
  }
}
