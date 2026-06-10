import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-user-menu',
    imports: [
        AsyncPipe,
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule
    ],
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserMenuComponent implements OnInit {
  public userImage = 'img/users/user.jpg';
  public user$ = this.authService.user$;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  public logout(): void {
    this.authService.logout().subscribe();
  }

}
