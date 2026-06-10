import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Company, CreateCompanyRequest, CustomerStatus } from '../../common/models/company.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';

export interface CompanyDialogData {
  company: Company | null;
}

@Component({
  selector: 'app-company-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './company-dialog.component.html'
})
export class CompanyDialogComponent {
  public form: FormGroup;
  public customerStatuses: CustomerStatus[] = ['LEAD', 'CUSTOMER'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyDialogComponent, CreateCompanyRequest>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyDialogData
  ) {
    this.form = this.fb.group({
      name: [data.company?.name ?? '', Validators.required],
      legalName: [data.company?.legalName ?? ''],
      taxId: [data.company?.taxId ?? ''],
      contactName: [data.company?.contactName ?? ''],
      email: [data.company?.email ?? '', emailValidator],
      phone: [data.company?.phone ?? ''],
      address: [data.company?.address ?? ''],
      city: [data.company?.city ?? ''],
      state: [data.company?.state ?? ''],
      customerType: [data.company?.customerType ?? ''],
      industry: [data.company?.industry ?? ''],
      billingEmail: [data.company?.billingEmail ?? '', emailValidator],
      paymentTerms: [data.company?.paymentTerms ?? ''],
      customerStatus: [data.company?.customerStatus ?? 'LEAD'],
      assignedAccountManager: [data.company?.assignedAccountManager ?? '']
    });
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.cleanPayload(this.form.value));
  }

  private cleanPayload(value: Record<string, unknown>): CreateCompanyRequest {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, entry === '' ? null : entry])
    ) as unknown as CreateCompanyRequest;
  }
}
