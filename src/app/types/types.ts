
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
  societyName?: string;
    isImpersonating : Boolean;
  impersonationSessionId : number;
    superAdminEmail : string;
    impersonationExpiresAt : Date;
    sessionId : number
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
  owner: Flat;
  image?: string;
}

export interface VehicleCreationRequest {
  registrationNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  flat: string
}

export interface VehicleFilter {
  id?: number;
  registrationNumber?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  owner?: number;
  user?: number
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
  flat?: Flat;
  tenant?: Tenant;
}

export interface ParkingSlotFilter {
  id?: number;
  area?: string;
  slotNumber?: string;
  status?: string;
  flat?: number;
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
  id: number
  flat: Flat;
  requestedSlot: ParkingSlot;
  status: ParkingRequestStatus;
  adminComment?: string;
  createdBy?: number
}

export interface ParkingBookingRequest {
  parkingSlotId: number;
  flatId: string


}

export interface ParkingRequestFilter {
  id?: number;
  flat?: number;
  requestedSlot?: number;
  status?: string;
  adminComment?: string;
}


export enum FlatMembershipType {
  OWNER,
  FAMILY,
  TENANT,
  GUEST
}

export enum FlatCategory {
  ONE_BHK,
  TWO_BHK,
  THREE_BHK,
  DUPLEX,
  STUDIO
}

export interface Flat {
  id?: number;
  block: string;
  number: number;
  floor: number;
  sqFt: number;
  tenant?: Tenant;
  members: FlatMember[];
  category: FlatCategory;
  hasActivePayment?: Boolean
  isOwner?: Boolean
}

export interface FlatMember {
  id?: number;
  flat?: Flat;
  user?: User;
  type: FlatMembershipType;
  isActive: boolean
}

export interface FlatFilter {
  id?: number;
  block?: string;
  number?: number;
  floor?: number;
  sqFt?: number;
  tenant?: number;
  member?: number;
  category?: string;
  isActive?: boolean
}

export interface FlatCreationRequest {
  block: string;
  number: number;
  floor: number;
  sqFt: number;
  category: FlatCategory;
}

export interface FlatMemberAddRequest {
  flatId: number;
  userId: number;
  type: FlatMembershipType;
}

export interface TenantCategoryPricing {

  tenant: Tenant;
  category: FlatCategory;
  monthlyFee: number;
}
export interface TenantCategoryPricingResponse {
  category: string;
  amount: number;
  penalty: number
}

export interface TenantCategoryPricingRequest {
  category: string;
  amount: number;
}

export interface PaymentCalculationDTO {
  monthlyFee: number;
  monthsCovered: number;
  finalAmount: number;
  penalty: number;
  billingStartDate: string;
  billingEndDate: string;
}

export interface PaymentRequestDTO {
  flatId: number;
  billingCycle: string;
  // paymentMethod: string;
}

export interface RazorpayOrderDTO {
  orderId: string;
  currency: string;
  amount: number;
  razorpayKeyId: string;
  paymentId: number;
  customerName: string;
  customerEmail: string;
  customerContact: string;
}

export interface PaymentVerificationDTO {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponseDTO {
  paymentId: number;
  referenceNumber: string;
  finalAmount: number;
  status: string;
  paymentDate: string;
  transactionId: string;
  billingStartDate: string;
  billingEndDate: string;
  message: string;
}

export enum PaymentStatus {
  PROCESSING,
  COMPLETED,
  FAILED,
  REFUNDED,
  CANCELLED
}

export interface Payment {
  id: number
  flat: Flat;
  user: User;
  billingStartDate: string;
  billingEndDate: string;
  billingCycle: string;
  monthsCovered: number;
  monthlyFee: number;
  finalAmount: number;
  status: PaymentStatus;
  paymentDate: string;
  transactionId: string;
  paymentMethod: string;
  paymentGatewayResponse: string;
  referenceNumber: string;
}

export interface PaymentFilter {
  id?: number;
  flat?: number;
  user?: number;
  billingStartDateFrom?: string;
  billingStartDateTo?: string;
  billingEndDateFrom?: string;
  billingEndDateTo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  billingCycle?: string;
  status?: string;
  transactionId?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  finalAmountMin?: number;
  finalAmountMax?: number;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  url?: string;
  type?: "USER" | 'SOCIETY';
  userId?: number;
  societyId?: number;
  read: boolean;
  createdAt: Date;
}

export enum VisitorStatus {
  PENDING,     // Request created, waiting for resident action
  APPROVED,    // Approved by resident, OTP generated
  REJECTED,    // Rejected by resident
  ENTERED,     // OTP verified, visitor entered
  EXITED,      // Visitor exited society
  EXPIRED,      // OTP expired / visit window missed,
  CANCELLED
}


export interface VisitorResponseDTO {
  id: number;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  purpose: string;
  rejectionReason: string;
  // Visit timing
  expectedIn: Date;
  expectedOut: Date;
  status: VisitorStatus;
  flat: Flat;
  requestedBy: User; // resident or security (for walk-in)
}

export interface VisitorRequestFilter {
  id?: number;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  purpose?: string;

  // Expected In range filters
  expectedInFrom?: Date;
  expectedInTo?: Date;

  // Expected Out range filters
  expectedOutFrom?: Date;
  expectedOutTo?: Date;

  status?: string;
  flat?: number;
  requestedBy?: number; // resident or security (for walk-in)

  // Approved At range filters
  approvedAtFrom?: Date;
  approvedAtTo?: Date;

  // Entered At range filters
  enteredAtFrom?: Date;
  enteredAtTo?: Date;

  // Exit At range filters
  exitedAtFrom?: Date;
  exitedAtTo?: Date;

  // Created At range filters
  createdAtFrom?: Date;
  createdAtTo?: Date;

  // Updated At range filters
  updatedAtFrom?: Date;
  updatedAtTo?: Date;

  isActive?: boolean;
  sortFilter?: SortFilter
}

export interface SortFilter {
  property: string;
  asc: boolean;
}

export interface GuestRequestDTO {
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  purpose: string;
  // Visit timing
  expectedIn: Date;
  expectedOut: Date;
  // Relationships
  flat: number;
}

export enum TicketStatus {
  OPEN,
  IN_PROGRESS,
  CLOSED
}

export interface SupportTicket {
  id: number
  title: string;
  description: string;
  raisedBy: User;
  status: TicketStatus;
  allowImpersonation: Boolean;
  impersonationUntil: Date;
}

export interface TicketRaiseRequest {
  title: string;
  description: string;
}

export interface SupportTicketFilter {
  id?: number
  title?: string;
  description?: string;
  raisedBy?: number;
  status?: string;
  allowImpersonation?: Boolean;
  impersonationUntil?: Date;
  isActive?: Boolean;
  sortFilter?: SortFilter;
}

export interface StartImpersonationResponseDto {

  sessionId: number;
  adminEmail: string;
  expiresAt: Date;
  ticketId: number;
}

export interface CurrentImpersonationDto {
  sessionId: number;
  adminEmail: string;
  expiresAt: Date;
  ticketId: number;
  isImpersonating: Boolean;
  superAdminEmail: string;
}

export interface ImpersonationSession {
  id: number;
  ticket: SupportTicket;
  admin: User;
  superAdmin: User;
  expiresAt: Date;
  endedAt: Date;
  createdAt:Date;
}

export interface ImpersonationSessionFilter {
  id?: number;
  admin?: number;
  superAdmin?: number;
  ticket?: number;
  expiresAtFrom?: Date;
  expiresAtTo?: Date;
  endedAtFrom?: Date;
  endedAtTo?: Date;
  endedAtIsNull?: boolean; // NEW: Check if endedAt is null
  isActive?: boolean;
  sortFilter?: SortFilter
}



export interface SocietyConfigurationRole {
  id?: number; // For existing roles
  name: string;
  isNew: boolean;
  menus: SocietyConfigurationMenu[];
}

export interface SocietyConfigurationMenu {
  id: number;
  menuName: string;
  menuDescription?: string;
  actions: SocietyConfigurationAction[];
}

export interface SocietyConfigurationAction {
  id: number;
  action: string;
  granted: boolean;
}

export interface SocietyConfiguration {
  societyName: string;
  roles: SocietyConfigurationRole[];
}

export interface SocietySetupRequest {
  societyName: string;
  configuration: {
    roles: Array<{
      roleId?: number;
      roleName: string;
      isNew: boolean;
      menuPermissions: Array<{
        menuId: number;
        actionIds: number[];
      }>;
    }>;
  };
}

export interface DragDropItem {
  type: 'role' | 'menu';
  data: any;
}