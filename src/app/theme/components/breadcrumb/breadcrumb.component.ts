import { Component, effect } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd, RouterModule } from "@angular/router"; 
import { Title } from '@angular/platform-browser';
import { Settings, SettingsService } from '../../../services/settings.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-breadcrumb',
    imports: [
        FlexLayoutModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        TranslatePipe
    ],
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

    public pageTitle:string;
    public breadcrumbs: {
        name: string;
        url: string
    }[] = [];

    public settings: Settings;
    constructor(public settingsService: SettingsService,
                public router: Router, 
                public activatedRoute: ActivatedRoute,                
                public title:Title,
                private translationService: TranslationService){
            this.settings = this.settingsService.settings; 
            this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.refreshBreadcrumbs();
            }
        })
        effect(() => {
            this.translationService.language();
            this.updateTitle();
        });
    }

    private refreshBreadcrumbs() {
        this.breadcrumbs = [];
        this.parseRoute(this.router.routerState.snapshot.root);
        this.updateTitle();
    }

    private updateTitle() {
        this.pageTitle = "";
        this.breadcrumbs.forEach(breadcrumb => {
            this.pageTitle += ' > ' + this.translationService.translate(breadcrumb.name);
        });
        this.title.setTitle(this.settings.name + this.pageTitle);
    }

    private parseRoute(node: ActivatedRouteSnapshot) { 
        if (node.data['breadcrumb']) {
            if(node.url.length){
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => {
                    return urlSegment.path;
                }).join('/');
                this.breadcrumbs.push({
                    name: node.data['breadcrumb'],
                    url: '/' + url
                }) 
            }         
        }
        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }

    public closeSubMenus(){
        let menu = document.querySelector(".sidenav-menu-outer");
        if(menu){
            for (let i = 0; i < menu.children[0].children.length; i++) {
                let child = menu.children[0].children[i];
                if(child){
                    if(child.children[0].classList.contains('expanded')){
                        child.children[0].classList.remove('expanded');
                        child.children[1].classList.remove('show');
                    }
                }
            }
        }
    }


}
