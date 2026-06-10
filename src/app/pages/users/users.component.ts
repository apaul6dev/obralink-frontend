import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { IdentityUser } from '../../common/models/identity-user.model';
import { Role } from '../../common/models/role.model';
import { AuthService } from '../../services/auth.service';
import { CompaniesService } from '../../services/companies.service';
import { IdentityUsersService } from '../../services/identity-users.service';
import { RolesService } from '../../services/roles.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { UserDialogComponent, UserDialogResult } from './user-dialog.component';
import { UserRolesDialogComponent } from './user-roles-dialog.component';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public users: IdentityUser[] = [];
  public companies: Company[] = [];
  public roles: Role[] = [];
  public dataSource = new MatTableDataSource<IdentityUser>([]);
  public displayedColumns = ['user', 'type', 'phone', 'status', 'actions'];
  public selectedUser: IdentityUser | null = null;
  public selectedCompanyId: string | null = null;
  public isLoading = false;

  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
    private usersService: IdentityUsersService,
    private rolesService: RolesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.selectedCompanyId = this.authService.currentUser?.companyId ?? null;
    this.loadCompanies();
    this.loadUsers();
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
    this.selectedUser = null;
    this.loadUsers();
    this.loadRoles();
  }

  public loadUsers(): void {
    if (this.isSystemOwner && !this.selectedCompanyId) {
      this.users = [];
      this.dataSource.data = [];
      this.showMessage('message.selectCompanyToListUsers');
      return;
    }

    this.isLoading = true;
    this.usersService.list(this.selectedCompanyId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: users => {
        this.users = users;
        this.dataSource.data = users;
      },
      error: () => this.showMessage('message.couldNotLoadUsers')
    });
  }

  public loadRoles(): void {
    if (this.isSystemOwner && !this.selectedCompanyId) {
      this.roles = [];
      return;
    }

    this.rolesService.list(this.selectedCompanyId).subscribe({
      next: roles => this.roles = roles,
      error: () => {
        this.roles = [];
        this.showMessage('message.couldNotLoadRoles');
      }
    });
  }

  public openCreateDialog(): void {
    if (this.isSystemOwner) {
      this.showMessage('message.companyUsersManagedByAdmin');
      return;
    }

    this.dialog.open(UserDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: {
        user: null,
        selectedCompanyId: this.selectedCompanyId,
        companies: this.companies,
        isSystemOwner: this.isSystemOwner
      }
    }).afterClosed().pipe(
      filter((result): result is UserDialogResult => !!result),
      filter(result => result.mode === 'create'),
      switchMap(result => this.usersService.create(result.payload))
    ).subscribe({
      next: user => {
        this.selectedUser = user;
        this.showMessage('message.userCreated');
        this.loadUsers();
      },
      error: () => this.showMessage('message.couldNotCreateUser')
    });
  }

  public openEditDialog(user: IdentityUser): void {
    this.selectedUser = user;
    this.dialog.open(UserDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: {
        user,
        selectedCompanyId: this.selectedCompanyId,
        companies: this.companies,
        isSystemOwner: this.isSystemOwner
      }
    }).afterClosed().pipe(
      filter((result): result is UserDialogResult => !!result),
      filter(result => result.mode === 'update'),
      switchMap(result => this.usersService.update(result.userId, result.payload))
    ).subscribe({
      next: updatedUser => {
        this.selectedUser = updatedUser;
        this.showMessage('message.userUpdated');
        this.loadUsers();
      },
      error: () => this.showMessage('message.couldNotUpdateUser')
    });
  }

  public openAssignRolesDialog(user: IdentityUser): void {
    if (this.isSystemOwner) {
      this.showMessage('message.rolesAssignedByAdmin');
      return;
    }

    this.selectedUser = user;
    this.dialog.open(UserRolesDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { user, roles: this.roles }
    }).afterClosed().pipe(
      filter((roleIds): roleIds is string[] => Array.isArray(roleIds)),
      switchMap(roleIds => this.usersService.assignRoles(user.id, roleIds))
    ).subscribe({
      next: () => this.showMessage('message.rolesAssigned'),
      error: () => this.showMessage('message.couldNotAssignRoles')
    });
  }

  private showMessage(key: string): void {
    this.snackBar.open(
      this.translationService.translate(key),
      this.translationService.translate('action.close'),
      { duration: 3000 }
    );
  }
}
