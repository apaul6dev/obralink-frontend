import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { filter, finalize, switchMap } from 'rxjs';
import { Company } from '../../common/models/company.model';
import { Permission } from '../../common/models/permission.model';
import { CreateRoleRequest } from '../../common/models/role.model';
import { Role } from '../../common/models/role.model';
import { AuthService } from '../../services/auth.service';
import { CompaniesService } from '../../services/companies.service';
import { PermissionsService } from '../../services/permissions.service';
import { RolesService } from '../../services/roles.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { RoleDialogComponent } from './role-dialog.component';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public companies: Company[] = [];
  public permissions: Permission[] = [];
  public roles: Role[] = [];
  public dataSource = new MatTableDataSource<Role>([]);
  public displayedColumns = ['name', 'code', 'scope', 'status', 'permissions', 'actions'];
  public selectedCompanyId: string | null = null;
  public isLoading = false;

  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
    private permissionsService: PermissionsService,
    private rolesService: RolesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.selectedCompanyId = this.authService.currentUser?.companyId ?? null;
    this.loadCompanies();
    this.loadPermissions();
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public get isSystemOwner(): boolean {
    return this.authService.currentUser?.userType === 'SYSTEM_OWNER';
  }

  public get canCreateRole(): boolean {
    return this.hasPermission('ui.roles.create');
  }

  public canUpdateRole(role: Role): boolean {
    return this.hasPermission('ui.roles.update') && this.canManageRole(role);
  }

  public canDeleteRole(role: Role): boolean {
    return this.hasPermission('ui.roles.delete') && this.canManageRole(role);
  }

  public loadCompanies(): void {
    if (!this.isSystemOwner) {
      return;
    }

    this.companiesService.list().subscribe({
      next: companies => this.companies = companies,
      error: () => this.showMessage('message.couldNotLoadCompanies')
    });
  }

  public changeCompany(companyId: string): void {
    this.selectedCompanyId = companyId || null;
    this.loadRoles();
  }

  public loadPermissions(): void {
    if (!this.hasPermission('identity.permissions.read')) {
      return;
    }
    this.permissionsService.list().subscribe({
      next: permissions => this.permissions = permissions,
      error: () => this.showMessage('message.couldNotLoadPermissions')
    });
  }

  public loadRoles(): void {
    this.isLoading = true;
    this.rolesService.list(this.selectedCompanyId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: roles => {
        this.roles = roles;
        this.dataSource.data = roles;
      },
      error: () => this.showMessage('message.couldNotLoadRoles')
    });
  }

  public openCreateDialog(): void {
    const currentCompanyId = this.authService.currentUser?.companyId ?? null;
    this.dialog.open(RoleDialogComponent, {
      width: '780px',
      maxWidth: '95vw',
      data: { role: null, companies: this.companies, permissions: this.permissions, canSelectScope: this.isSystemOwner, defaultCompanyId: currentCompanyId }
    }).afterClosed().pipe(
      filter((payload): payload is CreateRoleRequest => !!payload),
      switchMap(payload => this.rolesService.create(this.withCurrentCompanyScope(payload)))
    ).subscribe({
      next: () => {
        this.showMessage('message.roleCreated');
        this.loadRoles();
      },
      error: () => this.showMessage('message.couldNotCreateRole')
    });
  }

  public openEditDialog(role: Role): void {
    this.dialog.open(RoleDialogComponent, {
      width: '780px',
      maxWidth: '95vw',
      data: { role, companies: this.companies, permissions: this.permissions, canSelectScope: this.isSystemOwner, defaultCompanyId: this.authService.currentUser?.companyId ?? null }
    }).afterClosed().pipe(
      filter((payload): payload is CreateRoleRequest => !!payload),
      switchMap(payload => this.rolesService.update(role.id, this.withCurrentCompanyScope(payload)))
    ).subscribe({
      next: () => {
        this.showMessage('message.roleUpdated');
        this.loadRoles();
      },
      error: () => this.showMessage('message.couldNotUpdateRole')
    });
  }

  public remove(role: Role): void {
    this.rolesService.remove(role.id).subscribe({
      next: () => {
        this.showMessage('message.roleDeleted');
        this.loadRoles();
      },
      error: () => this.showMessage('message.couldNotDeleteRole')
    });
  }

  public scopeLabel(role: Role): string {
    if (!role.companyId) {
      return this.translationService.translate('common.global');
    }
    if (!this.isSystemOwner && role.companyId === this.authService.currentUser?.companyId) {
      return this.translationService.translate('common.company');
    }
    return this.companies.find(company => company.id === role.companyId)?.name ?? role.companyId;
  }

  private hasPermission(permission: string): boolean {
    const currentUser = this.authService.currentUser;
    if (currentUser?.userType === 'SYSTEM_OWNER') {
      return true;
    }
    return currentUser?.permissions.includes(permission) ?? false;
  }

  private canManageRole(role: Role): boolean {
    if (this.isSystemOwner) {
      return true;
    }
    return !!role.companyId && role.companyId === this.authService.currentUser?.companyId;
  }

  private withCurrentCompanyScope(payload: CreateRoleRequest): CreateRoleRequest {
    if (this.isSystemOwner) {
      return payload;
    }
    return {
      ...payload,
      companyId: this.authService.currentUser?.companyId ?? null
    };
  }

  private showMessage(key: string): void {
    this.snackBar.open(
      this.translationService.translate(key),
      this.translationService.translate('action.close'),
      { duration: 3000 }
    );
  }
}
