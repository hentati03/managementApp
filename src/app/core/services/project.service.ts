import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(params?: { status?: string; search?: string }): Observable<ApiResponse<Project[]>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, data);
  }

  update(id: string, data: UpdateProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.patch<ApiResponse<Project>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  addMember(projectId: string, userId: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${projectId}/members/${userId}`,
      {}
    );
  }

  removeMember(projectId: string, userId: string): Observable<ApiResponse<Project>> {
    return this.http.delete<ApiResponse<Project>>(
      `${this.apiUrl}/${projectId}/members/${userId}`
    );
  }

  getMyProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/my-projects`);
  }
}
