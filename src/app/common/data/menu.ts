import { Menu } from '../models/menu.model';

export const verticalMenuItems = [ 
    new Menu (1, 'nav.home', '/', null, 'dashboard', null, false, 0),
    new Menu (2, 'nav.administration', null, null, 'admin_panel_settings', null, true, 0),
    new Menu (3, 'nav.companies', '/companies', null, 'business', null, false, 2),
    new Menu (4, 'nav.users', '/users', null, 'group', null, false, 2),
    new Menu (5, 'nav.roles', '/roles', null, 'verified_user', null, false, 2),
    new Menu (6, 'nav.menuManagement', '/menu-management', null, 'menu_open', null, false, 2),
    new Menu (7, 'nav.permissions', '/permissions', null, 'key', null, false, 2)
]

export const horizontalMenuItems = [ 
    new Menu (1, 'nav.home', '/', null, 'dashboard', null, false, 0),
    new Menu (2, 'nav.administration', null, null, 'admin_panel_settings', null, true, 0),
    new Menu (3, 'nav.companies', '/companies', null, 'business', null, false, 2),
    new Menu (4, 'nav.users', '/users', null, 'group', null, false, 2),
    new Menu (5, 'nav.roles', '/roles', null, 'verified_user', null, false, 2),
    new Menu (6, 'nav.menuManagement', '/menu-management', null, 'menu_open', null, false, 2),
    new Menu (7, 'nav.permissions', '/permissions', null, 'key', null, false, 2)
]
