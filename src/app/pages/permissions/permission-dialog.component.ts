import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppModule } from '../../common/models/app-module.model';
import { CreatePermissionRequest, Permission } from '../../common/models/permission.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface PermissionDialogData {
  permission: Permission | null;
  modules: AppModule[];
}

@Component({
  selector: 'app-permission-dialog',
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
  templateUrl: './permission-dialog.component.html'
})
export class PermissionDialogComponent {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PermissionDialogComponent, CreatePermissionRequest>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionDialogData
  ) {
    this.form = this.fb.group({
      code: [data.permission?.code ?? '', Validators.required],
      moduleId: [data.permission?.moduleId ?? '', Validators.required],
      category: [data.permission?.category ?? 'API', Validators.required],
      action: [data.permission?.action ?? ''],
      label: [data.permission?.label ?? ''],
      description: [data.permission?.description ?? '']
    });
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Record<string, string>;
    this.dialogRef.close({
      code: value.code.trim(),
      moduleId: value.moduleId,
      category: value.category as 'API' | 'UI',
      action: value.action?.trim() || undefined,
      label: value.label?.trim() || undefined,
      description: value.description?.trim() || null
    });
  }
}
