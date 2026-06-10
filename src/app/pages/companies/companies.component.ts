import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { filter, finalize, switchMap } from 'rxjs';
import { Company, CreateCompanyRequest } from '../../common/models/company.model';
import { CreateCompanyAdminRequest } from '../../common/models/identity-user.model';
import { CompaniesService } from '../../services/companies.service';
import { TranslationService } from '../../services/translation.service';
import { emailValidator } from '../../theme/utils/app-validators';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
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
    MatSnackBarModule,
    MatTableModule,
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
  public isLoading = false;
  public isCreatingAdmin = false;
  public adminForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private companiesService: CompaniesService,
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
      phoneNumber: ['']
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

  public createAdmin(): void {
    if (!this.selectedCompany) {
      this.showMessage('message.selectCompany');
      return;
    }

    if (this.adminForm.invalid || this.isCreatingAdmin) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isCreatingAdmin = true;
    const value = this.adminForm.value as Record<string, string>;
    const payload: CreateCompanyAdminRequest = {
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null
    };

    this.companiesService.createAdmin(this.selectedCompany.id, payload).pipe(
      finalize(() => this.isCreatingAdmin = false)
    ).subscribe({
      next: () => {
        this.adminForm.reset();
        this.showMessage('message.companyAdminCreated');
      },
      error: () => this.showMessage('message.couldNotCreateAdmin')
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

  private showMessage(key: string): void {
    this.snackBar.open(
      this.translationService.translate(key),
      this.translationService.translate('action.close'),
      { duration: 3000 }
    );
  }
}
