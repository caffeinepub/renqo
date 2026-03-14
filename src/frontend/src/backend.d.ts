import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SecurityDeposit {
    tenantId: bigint;
    dateReceived: string;
    amount: bigint;
    paidStatus: boolean;
}
export interface RentPayment {
    month: bigint;
    rentAmount: bigint;
    year: bigint;
    tenantId: bigint;
    amountPaid: bigint;
    dueDay: bigint;
    notes: string;
    paymentDate: string;
    paidStatus: boolean;
}
export interface Tenant {
    id: bigint;
    leavingDate: string;
    name: string;
    email: string;
    notes: string;
    unitNumber: string;
    phone: string;
    moveInDate: string;
    brokerContact: string;
    brokerName: string;
}
export interface Reminder {
    status: string;
    createdDate: string;
    tenantId: bigint;
    billType: string;
    message: string;
}
export interface RentalAgreement {
    endDate: string;
    tenantId: bigint;
    startDate: string;
}
export interface Bill {
    id: bigint;
    dueDate: string;
    billingPeriod: string;
    tenantId: bigint;
    billType: string;
    notes: string;
    paymentDate: string;
    amountDue: bigint;
    paidStatus: boolean;
}
export interface PropertyListing {
    id: bigint;
    title: string;
    photoUrls: Array<string>;
    rentPrice: bigint;
    ownerId: Principal;
    bedrooms: bigint;
    createdAt: string;
    isAvailable: boolean;
    description: string;
    amenities: Array<string>;
    address: string;
    bathrooms: bigint;
}
export interface DashboardStats {
    totalExpectedRentThisMonth: bigint;
    totalTenants: bigint;
    overdueBills: bigint;
    overdueRents: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBill(tenantId: bigint, billType: string, billingPeriod: string, amountDue: bigint, dueDate: string, notes: string): Promise<bigint>;
    addReminder(tenantId: bigint, billType: string, message: string, createdDate: string, status: string): Promise<void>;
    addRentPayment(tenantId: bigint, month: bigint, year: bigint, amount: bigint, rentAmount: bigint, dueDay: bigint): Promise<void>;
    addRentalAgreement(tenantId: bigint, startDate: string, endDate: string): Promise<void>;
    addSecurityDeposit(tenantId: bigint, amount: bigint, paidStatus: boolean, dateReceived: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPropertyListing(title: string, address: string, description: string, bedrooms: bigint, bathrooms: bigint, rentPrice: bigint, amenities: Array<string>, photoUrls: Array<string>, createdAt: string): Promise<bigint>;
    createTenant(name: string, phone: string, email: string, unitNumber: string, moveInDate: string, leavingDate: string, brokerName: string, brokerContact: string, notes: string): Promise<bigint>;
    deletePropertyListing(id: bigint): Promise<void>;
    deleteTenant(id: bigint): Promise<void>;
    getAllBills(): Promise<Array<Bill>>;
    getAllPropertyListings(): Promise<Array<PropertyListing>>;
    getAllTenants(): Promise<Array<Tenant>>;
    getBill(id: bigint): Promise<Bill | null>;
    getBillsByTenant(tenantId: bigint): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyPropertyListings(): Promise<Array<PropertyListing>>;
    getPropertyListing(id: bigint): Promise<PropertyListing>;
    getReminders(tenantId: bigint): Promise<Array<Reminder>>;
    getRentPayments(tenantId: bigint): Promise<Array<RentPayment>>;
    getRentalAgreement(tenantId: bigint): Promise<RentalAgreement | null>;
    getSecurityDeposit(tenantId: bigint): Promise<SecurityDeposit | null>;
    getTenant(id: bigint): Promise<Tenant>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBillStatus(id: bigint, paidStatus: boolean, paymentDate: string, notes: string): Promise<void>;
    updatePropertyListing(id: bigint, title: string, address: string, description: string, bedrooms: bigint, bathrooms: bigint, rentPrice: bigint, amenities: Array<string>, isAvailable: boolean, photoUrls: Array<string>): Promise<void>;
    updateRentPaymentStatus(tenantId: bigint, month: bigint, year: bigint, paidStatus: boolean, paymentDate: string, notes: string): Promise<void>;
    updateTenant(id: bigint, name: string, phone: string, email: string, unitNumber: string, moveInDate: string, leavingDate: string, brokerName: string, brokerContact: string, notes: string): Promise<void>;
}
