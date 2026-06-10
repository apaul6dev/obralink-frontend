import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { finalize } from 'rxjs';
import { Company } from '../../common/models/company.model';
import { CreateIdentityUserRequest, IdentityUser, UserStatus, UserType } from '../../common/models/identity-user.model';
import { Role } from '../../common/models/role.model';
import { AuthService } from '../../services/auth.service';
import { CompaniesService } from '../../services/companies.service';
import { IdentityUsersService } from '../../services/identity-users.service';
import { RolesService } from '../../services/roles.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  public users: IdentityUser[] = [];
  public companies: Company[] = [];
  public roles: Role[] = [];
  public selectedUser: IdentityUser | null = null;
  public selectedCompanyId: string | null = null;
  public isLoading = false;
  public isSaving = false;
  public form: FormGroup;
  public roleForm: FormGroup;
  public userTypes: UserType[] = ['COMPANY_ADMIN', 'COMPANY_USER'];
  public statuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private companiesService: CompaniesService,
    private usersService: IdentityUsersService,
    private rolesService: RolesService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {
    this.form = this.fb.group({
      companyId: [''],
      email: ['', [Validators.required, emailValidator]],
      password: ['', [Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userType: ['COMPANY_USER', Validators.required],
      identificationNumber: [''],
      personalEmail: ['', emailValidator],
      phoneNumber: [''],
      status: ['ACTIVE']
    });
    this.roleForm = this.fb.group({
      roleIds: [[]]
    });
  }

  ngOnInit(): void {
    this.selectedCompanyId = this.authService.currentUser?.companyId ?? null;
    this.loadCompanies();
    this.loadUsers();
    this.loadRoles();
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
    this.form.patchValue({ companyId: this.selectedCompanyId ?? '' });
    this.selectedUser = null;
    this.loadUsers();
    this.loadRoles();
  }

  public loadUsers(): void {
    if (this.isSystemOwner && !this.selectedCompanyId) {
      this.users = [];
      this.showMessage('message.selectCompanyToListUsers');
      return;
    }

    this.isLoading = true;
    this.usersService.list(this.selectedCompanyId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: users => this.users = users,
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
      error: () => this.roles = []
    });
  }

  public selectUser(user: IdentityUser): void {
    this.selectedUser = user;
    this.form.patchValue({
      companyId: user.companyId ?? '',
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      identificationNumber: user.identificationNumber,
      personalEmail: user.personalEmail,
      phoneNumber: user.phoneNumber,
      status: user.status
    });
    this.roleForm.patchValue({ roleIds: [] });
  }

  public newUser(): void {
    this.selectedUser = null;
    this.form.reset({
      companyId: this.selectedCompanyId ?? '',
      userType: 'COMPANY_USER',
      status: 'ACTIVE'
    });
    this.roleForm.reset({ roleIds: [] });
  }

  public save(): void {
    if (this.isSystemOwner) {
      this.showMessage('message.companyUsersManagedByAdmin');
      return;
    }

    if (this.isSaving) {
      return;
    }

    if (this.selectedUser) {
      this.updateUser();
      return;
    }

    this.createUser();
  }

  public assignRoles(): void {
    if (this.isSystemOwner) {
      this.showMessage('message.rolesAssignedByAdmin');
      return;
    }

    if (!this.selectedUser) {
      this.showMessage('message.selectUser');
      return;
    }

    const roleIds = this.roleForm.value.roleIds as string[];
    this.usersService.assignRoles(this.selectedUser.id, roleIds ?? []).subscribe({
      next: () => this.showMessage('message.rolesAssigned'),
      error: () => this.showMessage('message.couldNotAssignRoles')
    });
  }

  private createUser(): void {
    this.form.get('password')?.addValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.value as Record<string, string>;
    const payload: CreateIdentityUserRequest = {
      companyId: value.companyId || this.selectedCompanyId,
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName,
      userType: value.userType as UserType,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null
    };

    this.usersService.create(payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: user => {
        this.showMessage('message.userCreated');
        this.selectedUser = user;
        this.loadUsers();
      },
      error: () => this.showMessage('message.couldNotCreateUser')
    });
  }

  private updateUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.value as Record<string, string>;
    this.usersService.update(this.selectedUser.id, {
      firstName: value.firstName,
      lastName: value.lastName,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null,
      status: value.status as UserStatus
    }).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: user => {
        this.showMessage('message.userUpdated');
        this.selectedUser = user;
        this.loadUsers();
      },
      error: () => this.showMessage('message.couldNotUpdateUser')
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
