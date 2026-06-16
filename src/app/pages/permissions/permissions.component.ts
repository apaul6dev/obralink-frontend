import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { filter, finalize, forkJoin, switchMap } from 'rxjs';
import { AppModule } from '../../common/models/app-module.model';
import { CreatePermissionRequest, Permission } from '../../common/models/permission.model';
import { AppModulesService } from '../../services/app-modules.service';
import { PermissionsService } from '../../services/permissions.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { PermissionDialogComponent } from './permission-dialog.component';

@Component({
  selector: 'app-permissions',
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public dataSource = new MatTableDataSource<Permission>([]);
  public modules: AppModule[] = [];
  public displayedColumns = ['code', 'module', 'category', 'description', 'actions'];
  public isLoading = false;

  constructor(
    private permissionsService: PermissionsService,
    private appModulesService: AppModulesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public loadPermissions(): void {
    this.isLoading = true;
    forkJoin({
      permissions: this.permissionsService.list(),
      modules: this.appModulesService.list()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: result => {
        this.dataSource.data = result.permissions;
        this.modules = result.modules;
      },
      error: () => this.showMessage('message.couldNotLoadPermissions')
    });
  }

  public openCreateDialog(): void {
    this.dialog.open(PermissionDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { permission: null, modules: this.modules }
    }).afterClosed().pipe(
      filter((payload): payload is CreatePermissionRequest => !!payload),
      switchMap(payload => this.permissionsService.create(payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.permissionCreated');
        this.loadPermissions();
      },
      error: () => this.showMessage('message.couldNotCreatePermission')
    });
  }

  public openEditDialog(permission: Permission): void {
    this.dialog.open(PermissionDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { permission, modules: this.modules }
    }).afterClosed().pipe(
      filter((payload): payload is CreatePermissionRequest => !!payload),
      switchMap(payload => this.permissionsService.update(permission.id, payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.permissionUpdated');
        this.loadPermissions();
      },
      error: () => this.showMessage('message.couldNotUpdatePermission')
    });
  }

  public remove(permission: Permission): void {
    this.permissionsService.remove(permission.id).subscribe({
      next: () => {
        this.showMessage('message.permissionDeleted');
        this.loadPermissions();
      },
      error: () => this.showMessage('message.couldNotDeletePermission')
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
