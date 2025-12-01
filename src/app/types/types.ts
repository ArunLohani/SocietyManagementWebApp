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
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  roles: Array<string>
}

export type JwtPayload = {

  email: string,
  sub: string,
  roles: string,
  tenantId: number
}

export type Tenant = {
  name: string,
  id: number;
  isActive: boolean;
}
export interface TenantRoles {
  id: number;
  tenant: Tenant;
  role: Role;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TenantWithRoles extends Tenant {
  assignedRoles?: number[]; // Array of role IDs
}

export type Role = {
  role: string,
  id: number
}

export type UserWithRoles = {
  id: number,
  name: string,
  email: string,
  phoneNumber: string,
  assignedRoleIds: Array<number>,
  assignedRoleNames: Array<string>,
}

export type RoleAssignmentReques = {
  userId: number,
  roleId: number
}



export interface Menu {

  id: number;
  menuName: string;
  menuDescription?: string;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive?: boolean;

}

export interface MenuCreateRequest {
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
  isActive?: boolean;
}

export interface TenantRoles {
  id: number;
  tenant: Tenant;
  role: Role;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TenantRoleMenu {
  id: number;
  tenantRoles: TenantRoles;
  menu: Menu;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TenantRoleMenuAction {
  id: number;
  tenantRoleMenu: TenantRoleMenu;
  action: Action;
  isActive: boolean;
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

  content: T[]

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

export interface Notice {
  id: number;
  title: string;
  message: string;
  category: string;
  tenant: Tenant;
  isPublic: boolean;
  isExpired: boolean;
  priority: "LOW" | "NORMAL" | "URGENT"
}


export interface NoticeCreationRequest {
  title: string;
  message: string;
  category: string;
  isPublic: boolean;
  isExpired: boolean;
}

export interface NoticeFilter {
  id?: number,
  title?: string;
  message?: string;
  category?: string;
  isPublic?: boolean;
  isExpired?: boolean;
  isActive?: boolean;
  tenantId?: number,
}

export interface Event {
  id: number,
  name: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  isPublic: boolean;
  isExpired: boolean;
  status: "PUBLISHED" | "CANCELLED" | "COMPLETED";
  tenant: Tenant;
  organizedBy: User;
  registrationRequired: boolean;
  maxParticipants: number;
  participants: User[]
}

export interface EventCreationRequest {
  name: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  isPublic: boolean;
  isExpired: boolean;
  status: "PUBLISHED" | "CANCELLED" | "COMPLETED";
  organizedBy: number;
  registrationRequired: boolean;
  maxParticipants: number;

}

export interface EventResponse {
  name: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  isPublic: boolean;
  isExpired: boolean;
  status: "PUBLISHED" | "CANCELLED" | "COMPLETED";
  organizedBy: User;
  registrationRequired: boolean;
  maxParticipants: number;
}


export interface EventFilter {
  id?: number,
  name?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  organizedBy?: number
  isActive?: boolean;
  status?: string;
  location?: string;
  tenantId?: number,
}

export interface Complaints {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  tenant: Tenant;
  raisedByUser: User;
  assignedToUser: User | null;
  priority: "LOW" | "NORMAL" | "URGENT";
  resolutionNotes: string
}

export interface ComplaintIssuingRequest {
  title: string;
  description: string;
  category: string;
  raisedByUser: number;
  priority: "LOW" | "NORMAL" | "URGENT";
}

export interface ComplaintsFilter {
  id?: number
  title?: string;
  description?: string;
  category?: string;
  raisedByUser?: number;
  assignedToUser?: number;
  isActive?: boolean,
  tenantId?: number,
  status?: string;
  priority?: string;
}


export interface Vehicle {
  id: number
  registrationNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  owner: User;
  image?: string;
}

export interface VehicleCreationRequest {
  registrationNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
}

export interface VehicleFilter {
  id?: number;
  registrationNumber?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  owner?: number;
}

export enum ParkingSlotStatus {
  AVAILABLE,
  OCCUPIED,
  RESERVED,
  OUT_OF_SERVICE
}

export interface ParkingSlot {
  id: number,
  area: string;
  slotNumber: string;
  status: ParkingSlotStatus;
  user?: User;
  tenant?: Tenant;
}

export interface ParkingSlotFilter {
  id?: number;
  area?: string;
  slotNumber?: string;
  status?: string;
  user?: number;
  tenant?: number;
}

export interface ParkingSlotRegisterRequest {
  area: string;
  slotNumber: string;
}

export enum ParkingRequestStatus {
  PENDING,
  APPROVED,
  REJECTED
}

export interface ParkingRequest {
  id:number
  user: User;
  requestedSlot: ParkingSlot;
  status: ParkingRequestStatus;
  adminComment?: string;
}

export interface ParkingBookingRequest {
  parkingSlotId: number;

}

export interface ParkingRequestFilter{
     id?: number;
     user? : number;
     requestedSlot? : number;
     status?:string;
     adminComment?:string;
}