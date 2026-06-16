import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMenuAdminItemRequest, MenuAdminItem, MenuAdminOptions, MenuAdminTreeNode, UpdateMenuAdminItemRequest } from '../common/models/menu-admin.model';

@Injectable({
  providedIn: 'root'
})
export class MenuAdminService {
  private readonly apiUrl = '/api/identity/menu/admin';

  constructor(private http: HttpClient) { }

  list(): Observable<MenuAdminItem[]> {
    return this.http.get<MenuAdminItem[]>(this.apiUrl);
  }

  tree(): Observable<MenuAdminTreeNode[]> {
    return this.http.get<MenuAdminTreeNode[]>(`${this.apiUrl}/tree`);
  }

  options(): Observable<MenuAdminOptions> {
    return this.http.get<MenuAdminOptions>(`${this.apiUrl}/options`);
  }

  create(payload: CreateMenuAdminItemRequest): Observable<MenuAdminItem> {
    return this.http.post<MenuAdminItem>(this.apiUrl, payload);
  }

  update(menuItemId: string, payload: UpdateMenuAdminItemRequest): Observable<MenuAdminItem> {
    return this.http.patch<MenuAdminItem>(`${this.apiUrl}/${menuItemId}`, payload);
  }

  remove(menuItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${menuItemId}`);
  }
}
