import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePermissionRequest, Permission, PermissionCatalogGroup, UpdatePermissionRequest } from '../common/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly apiUrl = '/api/identity/permissions';

  constructor(private http: HttpClient) { }

  list(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  catalog(): Observable<PermissionCatalogGroup[]> {
    return this.http.get<PermissionCatalogGroup[]>(`${this.apiUrl}/catalog`);
  }

  uiCatalog(): Observable<PermissionCatalogGroup[]> {
    return this.http.get<PermissionCatalogGroup[]>(`${this.apiUrl}/catalog/ui`);
  }

  create(payload: CreatePermissionRequest): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, payload);
  }

  update(permissionId: string, payload: UpdatePermissionRequest): Observable<Permission> {
    return this.http.patch<Permission>(`${this.apiUrl}/${permissionId}`, payload);
  }

  remove(permissionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${permissionId}`);
  }
}
