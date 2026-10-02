import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TimeEntry,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntrySummary,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class TimeEntryService {
  private apiUrl = `${environment.apiUrl}/time-entries`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    taskId?: string;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<TimeEntry[]>> {
    let httpParams = new HttpParams();
    if (params?.taskId) httpParams = httpParams.set('taskId', params.taskId);
    if (params?.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<TimeEntry[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<TimeEntry>> {
    return this.http.get<ApiResponse<TimeEntry>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTimeEntryRequest): Observable<ApiResponse<TimeEntry>> {
    return this.http.post<ApiResponse<TimeEntry>>(this.apiUrl, data);
  }

  update(id: string, data: UpdateTimeEntryRequest): Observable<ApiResponse<TimeEntry>> {
    return this.http.patch<ApiResponse<TimeEntry>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getMyEntries(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<TimeEntry[]>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.apiUrl}/my-entries`, { params: httpParams });
  }

  getMySummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<TimeEntrySummary>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<TimeEntrySummary>>(`${this.apiUrl}/my-summary`, { params: httpParams });
  }

  getMonthlyDuration(): Observable<ApiResponse<{ totalMinutes: number; entries: TimeEntry[] }>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    return this.http.get<ApiResponse<{ totalMinutes: number; entries: TimeEntry[] }>>(
      `${this.apiUrl}/my-entries`,
      { params: { startDate: startOfMonth, endDate: endOfMonth } }
    );
  }

  getProjectDurations(): Observable<ApiResponse<{ projectId: string; projectName: string; totalMinutes: number }[]>> {
    return this.http.get<ApiResponse<{ projectId: string; projectName: string; totalMinutes: number }[]>>(
      `${this.apiUrl}/project-durations`
    );
  }

  getAllEntries(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<TimeEntry[]>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<TimeEntry[]>>(this.apiUrl, { params: httpParams });
  }

  getUserEntries(userId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<TimeEntry[]>> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.apiUrl}/user/${userId}`, { params: httpParams });
  }
}
