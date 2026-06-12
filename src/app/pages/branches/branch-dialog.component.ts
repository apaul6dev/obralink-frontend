import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { BranchStatus, CompanyBranch, CreateCompanyBranchRequest } from '../../common/models/company-branch.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';

export interface BranchDialogData {
  branch: CompanyBranch | null;
}

@Component({
  selector: 'app-branch-dialog',
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
  templateUrl: './branch-dialog.component.html'
})
export class BranchDialogComponent {
  public form: FormGroup;
  public statuses: BranchStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BranchDialogComponent, CreateCompanyBranchRequest>,
    @Inject(MAT_DIALOG_DATA) public data: BranchDialogData
  ) {
    this.form = this.fb.group({
      name: [data.branch?.name ?? '', Validators.required],
      code: [data.branch?.code ?? '', Validators.required],
      address: [data.branch?.address ?? ''],
      city: [data.branch?.city ?? ''],
      state: [data.branch?.state ?? ''],
      phone: [data.branch?.phone ?? ''],
      email: [data.branch?.email ?? '', emailValidator],
      status: [data.branch?.status ?? 'ACTIVE', Validators.required]
    });
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Record<string, string>;
    this.dialogRef.close({
      name: value.name.trim(),
      code: value.code.trim(),
      address: value.address?.trim() || null,
      city: value.city?.trim() || null,
      state: value.state?.trim() || null,
      phone: value.phone?.trim() || null,
      email: value.email?.toLowerCase().trim() || null,
      status: value.status as BranchStatus
    });
  }
}
