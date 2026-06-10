import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter, OnChanges } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MenuService } from '../../../../services/menu.service';
import { Settings, SettingsService } from '../../../../services/settings.service';
import { Menu } from '../../../../common/models/menu.model';

import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
    selector: 'app-vertical-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslatePipe
    ],
    templateUrl: './vertical-menu.component.html',
    styleUrls: ['./vertical-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalMenuComponent implements OnInit, OnChanges {
  @Input('menuItems') menuItems: Menu[] = [];
  @Input('menuParentId') menuParentId: any;
  @Output() onClickMenuItem:EventEmitter<any> = new EventEmitter<any>();
  parentMenu:Array<any> = [];
  public settings: Settings;
  constructor(public settingsService: SettingsService, public menuService:MenuService, public router:Router) { 
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {     
    this.filterParentMenu();
  }

  ngOnChanges() {
    this.filterParentMenu();
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(this.settings.fixedHeader){
          let mainContent = document.getElementById('main-content');
          if(mainContent){
            mainContent.scrollTop = 0;
          }
        }
        else{
          document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;
        }
      }                
    });
  }

  onClick(menuId: any){
    this.menuService.toggleMenuItem(menuId);
    this.menuService.closeOtherSubMenus(this.menuItems, menuId);
    this.onClickMenuItem.emit(menuId);     
  }

  private filterParentMenu() {
    this.parentMenu = (this.menuItems ?? []).filter(item => item.parentId == this.menuParentId);
  }

}
