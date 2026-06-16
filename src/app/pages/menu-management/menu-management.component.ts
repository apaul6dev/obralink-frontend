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
import { CreateMenuAdminItemRequest, MenuAdminItem, MenuAdminOptions } from '../../common/models/menu-admin.model';
import { MenuAdminService } from '../../services/menu-admin.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { MenuItemDialogComponent } from './menu-item-dialog.component';

@Component({
  selector: 'app-menu-management',
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
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss'
})
export class MenuManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public menuItems: MenuAdminItem[] = [];
  public options: MenuAdminOptions | null = null;
  public dataSource = new MatTableDataSource<MenuAdminItem>([]);
  public displayedColumns = ['title', 'route', 'parent', 'permissions', 'order', 'status', 'actions'];
  public isLoading = false;

  constructor(
    private menuAdminService: MenuAdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public loadData(): void {
    this.isLoading = true;
    forkJoin({
      menuItems: this.menuAdminService.list(),
      options: this.menuAdminService.options()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: result => {
        this.menuItems = result.menuItems;
        this.options = result.options;
        this.dataSource.data = result.menuItems;
      },
      error: () => this.showMessage('message.couldNotLoadMenu')
    });
  }

  public openCreateDialog(): void {
    this.dialog.open(MenuItemDialogComponent, {
      width: '820px',
      maxWidth: '95vw',
      data: { menuItem: null, menuItems: this.menuItems, options: this.options }
    }).afterClosed().pipe(
      filter((payload): payload is CreateMenuAdminItemRequest => !!payload),
      switchMap(payload => this.menuAdminService.create(payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.menuCreated');
        this.loadData();
      },
      error: () => this.showMessage('message.couldNotCreateMenu')
    });
  }

  public openEditDialog(menuItem: MenuAdminItem): void {
    this.dialog.open(MenuItemDialogComponent, {
      width: '820px',
      maxWidth: '95vw',
      data: { menuItem, menuItems: this.menuItems, options: this.options }
    }).afterClosed().pipe(
      filter((payload): payload is CreateMenuAdminItemRequest => !!payload),
      switchMap(payload => this.menuAdminService.update(menuItem.id, payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.menuUpdated');
        this.loadData();
      },
      error: () => this.showMessage('message.couldNotUpdateMenu')
    });
  }

  public remove(menuItem: MenuAdminItem): void {
    this.menuAdminService.remove(menuItem.id).subscribe({
      next: () => {
        this.showMessage('message.menuDeleted');
        this.loadData();
      },
      error: () => this.showMessage('message.couldNotDeleteMenu')
    });
  }

  public permissionSummary(menuItem: MenuAdminItem): string {
    if (!menuItem.permissions?.length) {
      return '-';
    }
    return menuItem.permissions.map(permission => permission.label || permission.code).join(', ');
  }

  private showMessage(key: string): void {
    this.snackBar.open(
      this.translationService.translate(key),
      this.translationService.translate('action.close'),
      { duration: 3000 }
    );
  }
}
