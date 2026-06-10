import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { UserStatus, UserType } from '../../common/models/identity-user.model';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

export interface UserFiltersDialogData {
  status: string;
  type: string;
  statuses: UserStatus[];
  userTypes: UserType[];
}

export interface UserFiltersDialogResult {
  status: string;
  type: string;
}

@Component({
  selector: 'app-user-filters-dialog',
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './user-filters-dialog.component.html'
})
export class UserFiltersDialogComponent {
  public status = this.data.status;
  public type = this.data.type;

  constructor(
    private dialogRef: MatDialogRef<UserFiltersDialogComponent, UserFiltersDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: UserFiltersDialogData
  ) { }

  public clear(): void {
    this.status = '';
    this.type = '';
  }

  public apply(): void {
    this.dialogRef.close({
      status: this.status,
      type: this.type
    });
  }
}
