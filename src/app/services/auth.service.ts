import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthenticatedUser, AuthSession, LoginRequest } from '../common/models/auth.model';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  private sessionLoaded = false;

  public readonly session$ = this.sessionSubject.asObservable();
  public readonly user$ = this.session$.pipe(map(session => session ? this.toAuthenticatedUser(session) : null));

  constructor(private http: HttpClient, private router: Router, private menuService: MenuService) { }

  get session(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get currentUser(): AuthenticatedUser | null {
    return this.session ? this.toAuthenticatedUser(this.session) : null;
  }

  get isAuthenticated(): boolean {
    return !!this.session;
  }

  login(payload: LoginRequest): Observable<AuthSession | null> {
    return this.http.post<unknown>(`${this.apiUrl}/sign-in/email`, payload).pipe(
      switchMap(() => this.loadSession(true))
    );
  }

  loadSession(force = false): Observable<AuthSession | null> {
    if (this.sessionLoaded && !force) {
      return of(this.session);
    }

    return this.http.get<AuthSession | null>(`${this.apiUrl}/get-session`).pipe(
      tap(session => {
        this.sessionLoaded = true;
        this.sessionSubject.next(session);
      }),
      catchError(() => {
        this.sessionLoaded = true;
        this.sessionSubject.next(null);
        return of(null);
      })
    );
  }

  logout(): Observable<boolean> {
    return this.http.post<unknown>(`${this.apiUrl}/sign-out`, {}).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        this.sessionLoaded = true;
        this.sessionSubject.next(null);
        this.menuService.clearMenu();
        this.router.navigate(['/login']);
      })
    );
  }

  private toAuthenticatedUser(session: AuthSession): AuthenticatedUser {
    const role = session.user.role;
    return {
      id: session.user.id,
      name: session.user.name || session.user.email,
      email: session.user.email,
      userType: session.user.userType ?? 'COMPANY_USER',
      companyId: session.session.activeOrganizationId ?? session.user.companyId ?? null,
      branchId: session.user.branchId ?? null,
      roles: Array.isArray(role) ? role : (role ? role.split(',').map(value => value.trim()).filter(Boolean) : []),
      permissions: Array.isArray(session.user.permissions) ? session.user.permissions : []
    };
  }
}
