import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { finalize } from 'rxjs';
import { Company } from '../../common/models/company.model';
import { Role } from '../../common/models/role.model';
import { AuthService } from '../../services/auth.service';
import { CompaniesService } from '../../services/companies.service';
import { RolesService } from '../../services/roles.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  public companies: Company[] = [];
  public roles: Role[] = [];
  public selectedCompanyId: string | null = null;
  public isLoading = false;

  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
    private rolesService: RolesService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.selectedCompanyId = this.authService.currentUser?.companyId ?? null;
    this.loadCompanies();
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
    this.loadRoles();
  }

  public loadRoles(): void {
    if (this.isSystemOwner && !this.selectedCompanyId) {
      this.roles = [];
      this.showMessage('message.selectCompanyToListRoles');
      return;
    }

    this.isLoading = true;
    this.rolesService.list(this.selectedCompanyId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: roles => this.roles = roles,
      error: () => this.showMessage('message.couldNotLoadRoles')
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
