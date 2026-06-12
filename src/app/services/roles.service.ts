import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRoleRequest, Role, UpdateRoleRequest } from '../common/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly apiUrl = '/api/identity/roles';

  constructor(private http: HttpClient) { }

  list(companyId?: string | null): Observable<Role[]> {
    const params = companyId ? new HttpParams().set('companyId', companyId) : undefined;
    return this.http.get<Role[]>(this.apiUrl, { params });
  }

  create(payload: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, payload);
  }

  update(roleId: string, payload: UpdateRoleRequest): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${roleId}`, payload);
  }

  assignPermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/permissions`, { permissionIds });
  }

  remove(roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleId}`);
  }
}
