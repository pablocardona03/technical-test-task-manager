import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Task } from '../models/task.model';
import { TaskFilters } from '../models/task-filters.model';
import { TaskStatus } from '../models/task-status.type';
import { API_PROXY_PREFIX } from '../../../core/config/api.config';
import { CreateTaskRequest } from '../models/create-task.request';

@Injectable({
  providedIn: 'root'
})
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_PROXY_PREFIX}/tasks`;

  getTasks(filters: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.assignedUserId !== null) {
      params = params.set('assignedUserId', filters.assignedUserId);
    }

    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }

    if (filters.tag.trim()) {
      params = params.set('tag', filters.tag.trim());
    }

    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${taskId}`);
  }

  createTask(payload: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, payload);
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${taskId}/status`, { status });
  }
}
