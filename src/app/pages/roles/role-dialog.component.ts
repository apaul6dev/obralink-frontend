import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Company } from '../../common/models/company.model';
import { Permission } from '../../common/models/permission.model';
import { CreateRoleRequest, Role } from '../../common/models/role.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface RoleDialogData {
  role: Role | null;
  companies: Company[];
  permissions: Permission[];
  canSelectScope: boolean;
  defaultCompanyId: string | null;
}

@Component({
  selector: 'app-role-dialog',
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
  templateUrl: './role-dialog.component.html'
})
export class RoleDialogComponent {
  public form: FormGroup;
  public statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialogComponent, CreateRoleRequest>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {
    this.form = this.fb.group({
      companyId: [data.role?.companyId ?? data.defaultCompanyId ?? ''],
      name: [data.role?.name ?? '', Validators.required],
      code: [data.role?.code ?? '', Validators.required],
      status: [data.role?.status ?? 'ACTIVE', Validators.required],
      permissionIds: [data.role?.permissionIds ?? []]
    });
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as { companyId: string; name: string; code: string; status: string; permissionIds: string[] };
    this.dialogRef.close({
      companyId: value.companyId || null,
      name: value.name.trim(),
      code: value.code.trim(),
      status: value.status,
      permissionIds: value.permissionIds ?? []
    });
  }
}
