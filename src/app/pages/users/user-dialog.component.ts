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
import { CreateIdentityUserRequest, IdentityUser, UpdateIdentityUserRequest, UserStatus, UserType } from '../../common/models/identity-user.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { emailValidator } from '../../theme/utils/app-validators';

export interface UserDialogData {
  user: IdentityUser | null;
  selectedCompanyId: string | null;
  companies: Company[];
  isSystemOwner: boolean;
}

export type UserDialogResult =
  | { mode: 'create'; payload: CreateIdentityUserRequest }
  | { mode: 'update'; userId: string; payload: UpdateIdentityUserRequest };

@Component({
  selector: 'app-user-dialog',
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
  templateUrl: './user-dialog.component.html'
})
export class UserDialogComponent {
  public form: FormGroup;
  public userTypes: UserType[] = ['COMPANY_ADMIN', 'COMPANY_USER'];
  public statuses: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent, UserDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    const user = data.user;
    this.form = this.fb.group({
      companyId: [user?.companyId ?? data.selectedCompanyId ?? ''],
      email: [user?.email ?? '', [Validators.required, emailValidator]],
      password: ['', user ? [] : [Validators.required, Validators.minLength(8)]],
      firstName: [user?.firstName ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      userType: [user?.userType ?? 'COMPANY_USER', Validators.required],
      identificationNumber: [user?.identificationNumber ?? ''],
      personalEmail: [user?.personalEmail ?? '', emailValidator],
      phoneNumber: [user?.phoneNumber ?? ''],
      status: [user?.status ?? 'ACTIVE', Validators.required]
    });
  }

  public get isEditMode(): boolean {
    return !!this.data.user;
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Record<string, string>;
    if (this.data.user) {
      this.dialogRef.close({
        mode: 'update',
        userId: this.data.user.id,
        payload: this.buildUpdatePayload(value)
      });
      return;
    }

    this.dialogRef.close({
      mode: 'create',
      payload: this.buildCreatePayload(value)
    });
  }

  private buildCreatePayload(value: Record<string, string>): CreateIdentityUserRequest {
    return {
      companyId: value.companyId || this.data.selectedCompanyId,
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName,
      userType: value.userType as UserType,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null
    };
  }

  private buildUpdatePayload(value: Record<string, string>): UpdateIdentityUserRequest {
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      identificationNumber: value.identificationNumber || null,
      personalEmail: value.personalEmail || null,
      phoneNumber: value.phoneNumber || null,
      status: value.status as UserStatus
    };
  }
}
