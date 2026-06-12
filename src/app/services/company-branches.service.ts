import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyBranch, CreateCompanyBranchRequest, UpdateCompanyBranchRequest } from '../common/models/company-branch.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyBranchesService {
  constructor(private http: HttpClient) { }

  list(companyId: string): Observable<CompanyBranch[]> {
    return this.http.get<CompanyBranch[]>(this.apiUrl(companyId));
  }

  create(companyId: string, payload: CreateCompanyBranchRequest): Observable<CompanyBranch> {
    return this.http.post<CompanyBranch>(this.apiUrl(companyId), payload);
  }

  update(companyId: string, branchId: string, payload: UpdateCompanyBranchRequest): Observable<CompanyBranch> {
    return this.http.patch<CompanyBranch>(`${this.apiUrl(companyId)}/${branchId}`, payload);
  }

  remove(companyId: string, branchId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl(companyId)}/${branchId}`);
  }

  private apiUrl(companyId: string): string {
    return `/api/identity/companies/${companyId}/branches`;
  }
}
