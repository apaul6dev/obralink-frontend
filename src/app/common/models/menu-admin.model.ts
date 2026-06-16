import { UserType } from './identity-user.model';

export type MenuStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface MenuPermissionSummary {
  id: string;
  code: string;
  label: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string | null;
  action: string;
  category: 'API' | 'UI';
}

export interface MenuAdminItem {
  id: string;
  code: string;
  titleKey: string;
  routerLink: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  parentId: string | null;
  parentCode: string | null;
  displayOrder: number;
  allowedUserTypes: UserType[] | null;
  status: MenuStatus;
  permissionIds: string[];
  permissionCodes: string[];
  permissions: MenuPermissionSummary[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MenuAdminTreeNode extends MenuAdminItem {
  children: MenuAdminTreeNode[];
}

export interface MenuPermissionGroup {
  moduleId: string;
  moduleCode: string;
  label: string;
  icon: string | null;
  permissions: MenuPermissionSummary[];
}

export interface MenuAdminOptions {
  statuses: MenuStatus[];
  userTypes: UserType[];
  parentItems: Array<Pick<MenuAdminItem, 'id' | 'code' | 'titleKey' | 'parentId'>>;
  permissionGroups: MenuPermissionGroup[];
}

export interface CreateMenuAdminItemRequest {
  code: string;
  titleKey: string;
  routerLink?: string | null;
  href?: string | null;
  icon: string;
  target?: string | null;
  parentId?: string | null;
  displayOrder?: number;
  allowedUserTypes?: UserType[] | null;
  status?: MenuStatus;
  permissionIds?: string[];
}

export type UpdateMenuAdminItemRequest = Partial<CreateMenuAdminItemRequest>;
