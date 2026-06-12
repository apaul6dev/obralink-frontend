import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { UserType } from '../../common/models/identity-user.model';
import { CreateMenuAdminItemRequest, MenuAdminItem, MenuStatus } from '../../common/models/menu-admin.model';
import { Permission } from '../../common/models/permission.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface MenuItemDialogData {
  menuItem: MenuAdminItem | null;
  menuItems: MenuAdminItem[];
  permissions: Permission[];
}

@Component({
  selector: 'app-menu-item-dialog',
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
  templateUrl: './menu-item-dialog.component.html'
})
export class MenuItemDialogComponent {
  public form: FormGroup;
  public statuses: MenuStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  public userTypes: UserType[] = ['SYSTEM_OWNER', 'COMPANY_ADMIN', 'COMPANY_USER'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MenuItemDialogComponent, CreateMenuAdminItemRequest>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItemDialogData
  ) {
    const item = data.menuItem;
    this.form = this.fb.group({
      code: [item?.code ?? '', Validators.required],
      titleKey: [item?.titleKey ?? '', Validators.required],
      routerLink: [item?.routerLink ?? ''],
      href: [item?.href ?? ''],
      icon: [item?.icon ?? 'radio_button_unchecked', Validators.required],
      target: [item?.target ?? ''],
      parentId: [item?.parentId ?? ''],
      displayOrder: [item?.displayOrder ?? 0],
      allowedUserTypes: [item?.allowedUserTypes ?? []],
      status: [item?.status ?? 'ACTIVE', Validators.required],
      permissionIds: [item?.permissionIds ?? []]
    });
  }

  public get parentOptions(): MenuAdminItem[] {
    return this.data.menuItems.filter(item => item.id !== this.data.menuItem?.id);
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      code: string;
      titleKey: string;
      routerLink: string;
      href: string;
      icon: string;
      target: string;
      parentId: string;
      displayOrder: number;
      allowedUserTypes: UserType[];
      status: MenuStatus;
      permissionIds: string[];
    };
    this.dialogRef.close({
      code: value.code.trim(),
      titleKey: value.titleKey.trim(),
      routerLink: value.routerLink?.trim() || null,
      href: value.href?.trim() || null,
      icon: value.icon.trim(),
      target: value.target?.trim() || null,
      parentId: value.parentId || null,
      displayOrder: Number(value.displayOrder) || 0,
      allowedUserTypes: value.allowedUserTypes?.length ? value.allowedUserTypes : null,
      status: value.status,
      permissionIds: value.permissionIds ?? []
    });
  }
}
