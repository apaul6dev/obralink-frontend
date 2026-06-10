import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; 
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Menu } from '../common/models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = '/api/identity/menu';
  private readonly menuItemsSubject = new BehaviorSubject<Menu[]>([]);
  public readonly menuItems$ = this.menuItemsSubject.asObservable();
  private hasLoadedAuthorizedMenu = false;

  constructor(private http: HttpClient,
              private location:Location,
              private router:Router){ } 

  public loadAuthorizedMenu(force = false): Observable<Menu[]> {
    if (this.hasLoadedAuthorizedMenu && !force) {
      return of(this.menuItemsSubject.value);
    }

    return this.http.get<Menu[]>(this.apiUrl).pipe(
      tap(menuItems => {
        this.hasLoadedAuthorizedMenu = true;
        this.menuItemsSubject.next(menuItems);
      }),
      catchError(() => {
        this.hasLoadedAuthorizedMenu = true;
        this.menuItemsSubject.next([]);
        return of([]);
      })
    );
  }

  public clearMenu(): void {
    this.hasLoadedAuthorizedMenu = false;
    this.menuItemsSubject.next([]);
  }

  public getVerticalMenuItems():Array<Menu> {
    return this.menuItemsSubject.value;
  }

  public getHorizontalMenuItems():Array<Menu> {
    return this.menuItemsSubject.value;
  }

  public expandActiveSubMenu(menu:Array<Menu>){
      let url = this.location.path();
      let routerLink = url; // url.substring(1, url.length);
      let activeMenuItem = menu.filter(item => item.routerLink === routerLink);
      if(activeMenuItem[0]){
        let menuItem = activeMenuItem[0];
        while (menuItem.parentId != 0){  
          let parentMenuItem = menu.filter(item => item.id == menuItem.parentId)[0];
          menuItem = parentMenuItem;
          this.toggleMenuItem(menuItem.id);
        }
      }
  }

  public toggleMenuItem(menuId: any){
    let menuItem = document.getElementById('menu-item-'+menuId);
    let subMenu = document.getElementById('sub-menu-'+menuId); 
    if (menuItem) {
      if(subMenu){
        if(subMenu.classList.contains('show')){
          subMenu.classList.remove('show');
          menuItem.classList.remove('expanded');
        }
        else{
          subMenu.classList.add('show');
          menuItem.classList.add('expanded');
        }      
      }
    } 
   
  }

  public closeOtherSubMenus(menu:Array<Menu>, menuId: any){
    let currentMenuItem = menu.filter(item => item.id == menuId)[0]; 
    if(currentMenuItem.parentId == 0 && !currentMenuItem.target){
      menu.forEach(item => {
        if(item.id != menuId){
          let subMenu = document.getElementById('sub-menu-'+item.id);
          let menuItem = document.getElementById('menu-item-'+item.id);
          if (menuItem) {
            if(subMenu){
              if(subMenu.classList.contains('show')){
                subMenu.classList.remove('show');
                menuItem.classList.remove('expanded');
              }              
            } 
          }         
        }
      });
    }
  }
  

}
