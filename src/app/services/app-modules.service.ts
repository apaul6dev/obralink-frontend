import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppModule, CreateAppModuleRequest, UpdateAppModuleRequest } from '../common/models/app-module.model';

@Injectable({
  providedIn: 'root'
})
export class AppModulesService {
  private readonly apiUrl = '/api/identity/modules';

  constructor(private http: HttpClient) { }

  list(): Observable<AppModule[]> {
    return this.http.get<AppModule[]>(this.apiUrl);
  }

  create(payload: CreateAppModuleRequest): Observable<AppModule> {
    return this.http.post<AppModule>(this.apiUrl, payload);
  }

  update(moduleId: string, payload: UpdateAppModuleRequest): Observable<AppModule> {
    return this.http.patch<AppModule>(`${this.apiUrl}/${moduleId}`, payload);
  }

  remove(moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${moduleId}`);
  }
}
