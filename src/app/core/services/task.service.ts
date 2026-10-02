import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
  }): Observable<ApiResponse<Task[]>> {
    let httpParams = new HttpParams();
    if (params?.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.priority) httpParams = httpParams.set('priority', params.priority);
    if (params?.assigneeId) httpParams = httpParams.set('assigneeId', params.assigneeId);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ApiResponse<Task[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTaskRequest): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, data);
  }

  update(id: string, data: UpdateTaskRequest): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  assignUser(taskId: string, userId: string): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${this.apiUrl}/${taskId}/assign/${userId}`,
      {}
    );
  }

  unassignUser(taskId: string, userId: string): Observable<ApiResponse<Task>> {
    return this.http.delete<ApiResponse<Task>>(
      `${this.apiUrl}/${taskId}/assign/${userId}`
    );
  }

  getMyTasks(): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/my-tasks`);
  }

  getByProject(projectId: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/project/${projectId}`);
  }
}
