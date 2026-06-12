import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { filter, finalize, switchMap } from 'rxjs';
import { Company, CreateCompanyRequest } from '../../common/models/company.model';
import { CreateCompanyAdminRequest, IdentityUser, UpdateIdentityUserRequest, UserStatus } from '../../common/models/identity-user.model';
import { CompaniesService } from '../../services/companies.service';
import { IdentityUsersService } from '../../services/identity-users.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';
import { CompanyDialogComponent } from './company-dialog.component';

@Component({
  selector: 'app-companies',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public companies: Company[] = [];
  public dataSource = new MatTableDataSource<Company>([]);
  public displayedColumns = ['name', 'taxId', 'status', 'customerStatus', 'actions'];
  public selectedCompany: Company | null = null;
  public admins: IdentityUser[] = [];
  public adminColumns = ['user', 'status', 'actions'];
  public selectedAdmin: IdentityUser | null = null;
  public adminForm: FormGroup;
  public isLoading = false;
  public isLoadingAdmins = false;
  public isSavingAdmin = false;
  public statuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private usersService: IdentityUsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {
    this.adminForm = this.fb.group({
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
    this.loadCompanies();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public loadCompanies(): void {
    this.isLoading = true;
    this.companiesService.list().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: companies => {
        this.companies = companies;
        this.dataSource.data = companies;
      },
      error: () => this.showMessage('message.couldNotLoadCompanies')
    });
  }

  public selectCompany(company: Company): void {
    this.selectedCompany = company;
  }

  public selectCompanyForAdmins(company: Company): void {
    this.selectCompany(company);
    this.newAdmin();
    this.loadAdmins(company.id);
  }

  public openCreateDialog(): void {
    this.dialog.open(CompanyDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { company: null }
    }).afterClosed().pipe(
      filter((payload): payload is CreateCompanyRequest => !!payload),
      switchMap(payload => this.companiesService.create(payload))
    ).subscribe({
      next: company => {
        this.selectedCompany = company;
        this.showMessage('message.companyCreated');
        this.loadCompanies();
      },
      error: () => this.showMessage('message.couldNotCreateCompany')
    });
  }

  public openEditDialog(company: Company): void {
    this.selectCompany(company);
    this.dialog.open(CompanyDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { company }
    }).afterClosed().pipe(
      filter((payload): payload is CreateCompanyRequest => !!payload),
      switchMap(payload => this.companiesService.update(company.id, payload))
    ).subscribe({
      next: updatedCompany => {
        this.selectedCompany = updatedCompany;
        this.showMessage('message.companyUpdated');
        this.loadCompanies();
      },
      error: () => this.showMessage('message.couldNotUpdateCompany')
    });
  }

  public activate(company: Company): void {
    this.companiesService.activate(company.id).subscribe({
      next: () => {
        this.showMessage('message.companyActivated');
        this.loadCompanies();
      },
      error: () => this.showMessage('message.couldNotActivateCompany')
    });
  }

  public suspend(company: Company): void {
    this.companiesService.suspend(company.id).subscribe({
      next: () => {
        this.showMessage('message.companySuspended');
        this.loadCompanies();
      },
      error: () => this.showMessage('message.couldNotSuspendCompany')
    });
  }

  public get isAdminEditMode(): boolean {
    return !!this.selectedAdmin;
  }

  public loadAdmins(companyId = this.selectedCompany?.id): void {
    if (!companyId) {
      this.admins = [];
      return;
    }

    this.isLoadingAdmins = true;
    this.usersService.list(companyId).pipe(
      finalize(() => this.isLoadingAdmins = false)
    ).subscribe({
      next: users => this.admins = users.filter(user => user.userType === 'COMPANY_ADMIN'),
      error: () => this.showMessage('message.couldNotLoadAdmins')
    });
  }

  public newAdmin(): void {
    this.selectedAdmin = null;
    this.adminForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      identificationNumber: '',
      personalEmail: '',
      phoneNumber: '',
      status: 'ACTIVE'
    });
    this.adminForm.get('email')?.enable();
    this.adminForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.adminForm.get('password')?.updateValueAndValidity();
  }

  public selectAdmin(admin: IdentityUser): void {
    this.selectedAdmin = admin;
    this.adminForm.patchValue({
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      identificationNumber: admin.identificationNumber ?? '',
      personalEmail: admin.personalEmail ?? '',
      phoneNumber: admin.phoneNumber ?? '',
      status: admin.status
    });
    this.adminForm.get('email')?.disable();
    this.adminForm.get('password')?.clearValidators();
    this.adminForm.get('password')?.updateValueAndValidity();
  }

  public saveAdmin(): void {
    if (!this.selectedCompany || this.adminForm.invalid || this.isSavingAdmin) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isSavingAdmin = true;
    const value = this.adminForm.getRawValue() as Record<string, string>;
    const selectedAdmin = this.selectedAdmin;
    const request = selectedAdmin
      ? this.usersService.update(selectedAdmin.id, this.buildUpdateAdminPayload(value))
      : this.companiesService.createAdmin(this.selectedCompany.id, this.buildCreateAdminPayload(value));

    request.pipe(
      finalize(() => this.isSavingAdmin = false)
    ).subscribe({
      next: admin => {
        this.admins = selectedAdmin
          ? this.admins.map(item => item.id === admin.id ? admin : item)
          : [admin, ...this.admins];
        this.selectAdmin(admin);
        this.showMessage(selectedAdmin ? 'message.userUpdated' : 'message.companyAdminCreated');
      },
      error: () => this.showMessage(selectedAdmin ? 'message.couldNotUpdateUser' : 'message.couldNotCreateAdmin')
    });
  }

  private buildCreateAdminPayload(value: Record<string, string>): CreateCompanyAdminRequest {
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

  private buildUpdateAdminPayload(value: Record<string, string>): UpdateIdentityUserRequest {
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
