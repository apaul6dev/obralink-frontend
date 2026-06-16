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
import { filter, finalize, switchMap } from 'rxjs';
import { AppModule, CreateAppModuleRequest } from '../../common/models/app-module.model';
import { AppModulesService } from '../../services/app-modules.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { ModuleDialogComponent } from './module-dialog.component';

@Component({
  selector: 'app-modules',
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
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss'
})
export class ModulesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public dataSource = new MatTableDataSource<AppModule>([]);
  public displayedColumns = ['module', 'description', 'order', 'status', 'system', 'actions'];
  public isLoading = false;

  constructor(
    private appModulesService: AppModulesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadModules();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  public loadModules(): void {
    this.isLoading = true;
    this.appModulesService.list().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: modules => this.dataSource.data = modules,
      error: () => this.showMessage('message.couldNotLoadModules')
    });
  }

  public openCreateDialog(): void {
    this.dialog.open(ModuleDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { module: null }
    }).afterClosed().pipe(
      filter((payload): payload is CreateAppModuleRequest => !!payload),
      switchMap(payload => this.appModulesService.create(payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.moduleCreated');
        this.loadModules();
      },
      error: () => this.showMessage('message.couldNotCreateModule')
    });
  }

  public openEditDialog(module: AppModule): void {
    this.dialog.open(ModuleDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { module }
    }).afterClosed().pipe(
      filter((payload): payload is CreateAppModuleRequest => !!payload),
      switchMap(payload => this.appModulesService.update(module.id, payload))
    ).subscribe({
      next: () => {
        this.showMessage('message.moduleUpdated');
        this.loadModules();
      },
      error: () => this.showMessage('message.couldNotUpdateModule')
    });
  }

  public remove(module: AppModule): void {
    this.appModulesService.remove(module.id).subscribe({
      next: () => {
        this.showMessage('message.moduleDeleted');
        this.loadModules();
      },
      error: () => this.showMessage('message.couldNotDeleteModule')
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
