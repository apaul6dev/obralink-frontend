import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { IdentityUser } from '../../common/models/identity-user.model';
import { Role } from '../../common/models/role.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface UserRolesDialogData {
  user: IdentityUser;
  roles: Role[];
}

@Component({
  selector: 'app-user-roles-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './user-roles-dialog.component.html'
})
export class UserRolesDialogComponent {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserRolesDialogComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: UserRolesDialogData
  ) {
    this.form = this.fb.group({
      roleIds: [[]]
    });
  }

  public save(): void {
    this.dialogRef.close(this.form.value.roleIds ?? []);
  }
}
