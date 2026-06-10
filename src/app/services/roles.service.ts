import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../common/models/role.model';

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
}
