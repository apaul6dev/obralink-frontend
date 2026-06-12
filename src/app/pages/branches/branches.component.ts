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
import { CompanyBranch, CreateCompanyBranchRequest } from '../../common/models/company-branch.model';
import { Company } from '../../common/models/company.model';
import { AuthService } from '../../services/auth.service';
import { CompaniesService } from '../../services/companies.service';
import { CompanyBranchesService } from '../../services/company-branches.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { BranchDialogComponent } from './branch-dialog.component';

@Component({
  selector: 'app-branches',
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
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public companies: Company[] = [];
  public dataSource = new MatTableDataSource<CompanyBranch>([]);
  public displayedColumns = ['name', 'code', 'location', 'contact', 'status', 'actions'];
  public selectedCompanyId: string | null = null;
  public isLoading = false;

  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
    private branchesService: CompanyBranchesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.authService.loadSession(true).subscribe(() => this.initializeCompanyScope());
  }

  private initializeCompanyScope(): void {
    this.selectedCompanyId = this.authService.currentUser?.companyId ?? null;
    this.loadCompanies();
    this.loadBranches();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public get isSystemOwner(): boolean {
    return this.authService.currentUser?.userType === 'SYSTEM_OWNER';
  }

  public get canManageBranches(): boolean {
    return ['SYSTEM_OWNER', 'COMPANY_ADMIN'].includes(this.authService.currentUser?.userType ?? '');
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
    this.loadBranches();
  }

  public loadBranches(): void {
    if (!this.selectedCompanyId) {
      this.dataSource.data = [];
      this.showMessage('message.selectCompany');
      return;
    }
    this.isLoading = true;
    this.branchesService.list(this.selectedCompanyId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: branches => this.dataSource.data = branches,
      error: () => this.showMessage('message.couldNotLoadBranches')
    });
  }

  public openCreateDialog(): void {
    if (!this.canManageBranches) {
      return;
    }
    if (!this.selectedCompanyId) {
      this.showMessage('message.selectCompany');
      return;
    }
    this.dialog.open(BranchDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { branch: null }
    }).afterClosed().pipe(
      filter((payload): payload is CreateCompanyBranchRequest => !!payload),
      switchMap(payload => this.branchesService.create(this.selectedCompanyId as string, payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.branchCreated');
        this.loadBranches();
      },
      error: () => this.showMessage('message.couldNotCreateBranch')
    });
  }

  public openEditDialog(branch: CompanyBranch): void {
    if (!this.canManageBranches) {
      return;
    }
    this.dialog.open(BranchDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data: { branch }
    }).afterClosed().pipe(
      filter((payload): payload is CreateCompanyBranchRequest => !!payload),
      switchMap(payload => this.branchesService.update(branch.companyId, branch.id, payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.branchUpdated');
        this.loadBranches();
      },
      error: () => this.showMessage('message.couldNotUpdateBranch')
    });
  }

  public remove(branch: CompanyBranch): void {
    if (!this.canManageBranches) {
      return;
    }
    this.branchesService.remove(branch.companyId, branch.id).subscribe({
      next: () => {
        this.showMessage('message.branchDeleted');
        this.loadBranches();
      },
      error: () => this.showMessage('message.couldNotDeleteBranch')
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
