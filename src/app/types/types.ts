export type LoginRequestData = {

    email: string,
    password: string


}

export type ApiResponse<T> = {

    success: boolean,
    message: string,
    data: T
}



export type AuthSuccessData = {
    token: string,
    user: User
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  roles?: Array<string>;
  tenantId?: number;
}

export type RegisterRequestData = {
    name : string,
    email:string,
    password : string,
    phoneNumber:string,
    roles:Array<string>
}

export type JwtPayload = {

    email : string,
    id : string,
    roles:string
}

export type Tenant = {
    name : string,
    id:number;
    active : boolean;
}
export interface TenantRoles {
  id: number;
  tenant: Tenant;
  role: Role;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TenantWithRoles extends Tenant {
  assignedRoles?: number[]; // Array of role IDs
}

export type Role = {
    role : string,
    id:number
}

export type UserWithRoles = {
       id: number,
    name : string,
email : string,
    phoneNumber : string,
    assignedRoleIds : Array<number>,
     assignedRoleNames : Array<string>,
}

export type RoleAssignmentReques = {
    userId:number,
    roleId:number
}



export interface Menu {

  id: number;
  menuName: string;
  menuDescription?: string;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
   active?:boolean;

}

export interface MenuCreateRequest  {
  menuName: string;
  menuDescription?: string;
}

export interface Action {
  id: number;
  action: string;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
  active?:boolean;
}

export interface TenantRoles {
  id: number;
  tenant: Tenant;
  role: Role;
  active: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TenantRoleMenu {
  id: number;
  tenantRoles: TenantRoles;
  menu: Menu;
  active: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TenantRoleMenuAction {
  id: number;
  tenantRoleMenu: TenantRoleMenu;
  action: Action;
  active: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}


export interface MenuWithActions {
  menu: Menu;
  tenantRoleMenuId: number | null;
  hasMenuAccess: boolean;
  actions: ActionPermission[];
}

export interface ActionPermission {
  action: Action;
  granted: boolean;
  tenantRoleMenuActionId: number | null;
}


export type PaginatedResponse<T> = {

    content : T[]

}




export interface UserDetails {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  roles?: Array<string>;
  tenantId?: number;
}


export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
