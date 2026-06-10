import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { finalize } from 'rxjs';
import { Company } from '../../common/models/company.model';
import { CreateCompanyAdminRequest, IdentityUser, UpdateIdentityUserRequest, UserStatus } from '../../common/models/identity-user.model';
import { CompaniesService } from '../../services/companies.service';
import { IdentityUsersService } from '../../services/identity-users.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';

export interface CompanyAdminDialogData {
  company: Company;
}

@Component({
  selector: 'app-company-admin-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './company-admin-dialog.component.html'
})
export class CompanyAdminDialogComponent implements OnInit {
  public form: FormGroup;
  public admins: IdentityUser[] = [];
  public adminColumns = ['user', 'status', 'actions'];
  public selectedAdmin: IdentityUser | null = null;
  public isLoading = false;
  public isSaving = false;
  public statuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyAdminDialogComponent>,
    private companiesService: CompaniesService,
    private usersService: IdentityUsersService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: CompanyAdminDialogData
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, emailValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      identificationNumber: [''],
      personalEmail: ['', emailValidator],
      phoneNumber: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  public get isEditMode(): boolean {
    return !!this.selectedAdmin;
  }

  public loadAdmins(): void {
    this.isLoading = true;
    this.usersService.list(this.data.company.id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: users => this.admins = users.filter(user => user.userType === 'COMPANY_ADMIN'),
      error: () => this.showMessage('message.couldNotLoadAdmins')
    });
  }

  public newAdmin(): void {
    this.selectedAdmin = null;
    this.form.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      identificationNumber: '',
      personalEmail: '',
      phoneNumber: '',
      status: 'ACTIVE'
    });
    this.form.get('email')?.enable();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
  }

  public selectAdmin(admin: IdentityUser): void {
    this.selectedAdmin = admin;
    this.form.patchValue({
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      identificationNumber: admin.identificationNumber ?? '',
      personalEmail: admin.personalEmail ?? '',
      phoneNumber: admin.phoneNumber ?? '',
      status: admin.status
    });
    this.form.get('email')?.disable();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  public save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.selectedAdmin) {
      this.updateAdmin();
      return;
    }

    this.createAdmin();
  }

  public close(): void {
    this.dialogRef.close();
  }

  private createAdmin(): void {
    this.isSaving = true;
    const value = this.form.getRawValue() as Record<string, string>;
    this.companiesService.createAdmin(this.data.company.id, this.buildCreatePayload(value)).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: admin => {
        this.admins = [admin, ...this.admins];
        this.selectAdmin(admin);
        this.showMessage('message.companyAdminCreated');
      },
      error: () => this.showMessage('message.couldNotCreateAdmin')
    });
  }

  private updateAdmin(): void {
    if (!this.selectedAdmin) {
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue() as Record<string, string>;
    this.usersService.update(this.selectedAdmin.id, this.buildUpdatePayload(value)).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: admin => {
        this.admins = this.admins.map(item => item.id === admin.id ? admin : item);
        this.selectAdmin(admin);
        this.showMessage('message.userUpdated');
      },
      error: () => this.showMessage('message.couldNotUpdateUser')
    });
  }

  private buildCreatePayload(value: Record<string, string>): CreateCompanyAdminRequest {
    return {
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null
    };
  }

  private buildUpdatePayload(value: Record<string, string>): UpdateIdentityUserRequest {
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null,
      status: value.status as UserStatus
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
