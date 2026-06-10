import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIdentityUserRequest, IdentityUser, UpdateIdentityUserRequest } from '../common/models/identity-user.model';

@Injectable({
  providedIn: 'root'
})
export class IdentityUsersService {
  private readonly apiUrl = '/api/identity/users';

  constructor(private http: HttpClient) { }

  list(companyId?: string | null): Observable<IdentityUser[]> {
    const params = companyId ? new HttpParams().set('companyId', companyId) : undefined;
    return this.http.get<IdentityUser[]>(this.apiUrl, { params });
  }

  get(userId: string): Observable<IdentityUser> {
    return this.http.get<IdentityUser>(`${this.apiUrl}/${userId}`);
  }

  create(payload: CreateIdentityUserRequest): Observable<IdentityUser> {
    return this.http.post<IdentityUser>(this.apiUrl, payload);
  }

  update(userId: string, payload: UpdateIdentityUserRequest): Observable<IdentityUser> {
    return this.http.patch<IdentityUser>(`${this.apiUrl}/${userId}`, payload);
  }

  assignRoles(userId: string, roleIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/roles`, { roleIds });
  }
}
