import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../common/models/company.model';
import { CreateCompanyAdminRequest, IdentityUser } from '../common/models/identity-user.model';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private readonly apiUrl = '/api/identity/companies';

  constructor(private http: HttpClient) { }

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  get(companyId: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${companyId}`);
  }

  create(payload: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, payload);
  }

  update(companyId: string, payload: UpdateCompanyRequest): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${companyId}`, payload);
  }

  activate(companyId: string): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${companyId}/activate`, {});
  }

  suspend(companyId: string): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${companyId}/suspend`, {});
  }

  createAdmin(companyId: string, payload: CreateCompanyAdminRequest): Observable<IdentityUser> {
    return this.http.post<IdentityUser>(`${this.apiUrl}/${companyId}/admin`, payload);
  }
}
