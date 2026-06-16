import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppModule, CreateAppModuleRequest } from '../../common/models/app-module.model';
import { MenuStatus } from '../../common/models/menu-admin.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface ModuleDialogData {
  module: AppModule | null;
}

@Component({
  selector: 'app-module-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './module-dialog.component.html'
})
export class ModuleDialogComponent {
  public form: FormGroup;
  public statuses: MenuStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModuleDialogComponent, CreateAppModuleRequest>,
    @Inject(MAT_DIALOG_DATA) public data: ModuleDialogData
  ) {
    const module = data.module;
    this.form = this.fb.group({
      code: [module?.code ?? '', Validators.required],
      name: [module?.name ?? '', Validators.required],
      description: [module?.description ?? ''],
      icon: [module?.icon ?? 'view_module'],
      displayOrder: [module?.displayOrder ?? 0],
      status: [module?.status ?? 'ACTIVE', Validators.required],
      isSystem: [module?.isSystem ?? false]
    });
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      code: string;
      name: string;
      description: string;
      icon: string;
      displayOrder: number;
      status: MenuStatus;
      isSystem: boolean;
    };

    this.dialogRef.close({
      code: value.code.trim(),
      name: value.name.trim(),
      description: value.description?.trim() || null,
      icon: value.icon?.trim() || null,
      displayOrder: Number(value.displayOrder) || 0,
      status: value.status,
      isSystem: Boolean(value.isSystem)
    });
  }
}
