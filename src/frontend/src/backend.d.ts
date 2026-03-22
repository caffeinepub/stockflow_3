import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PendingParcel {
    id: bigint;
    businessId: string;
    packages: string;
    biltyNo: string;
    dateReceived: string;
    customData: Array<[string, string]>;
    transportName: string;
}
export interface StockDelta {
    shopDelta: bigint;
    godownDeltas: Array<GodownStock>;
}
export interface CategoryField {
    name: string;
    options: Array<string>;
    fieldType: string;
}
export type Time = bigint;
export interface GodownStock {
    name: string;
    quantity: bigint;
}
export interface CustomColumns {
    transit: Array<ColumnDef>;
    inward: Array<ColumnDef>;
    warehouse: Array<ColumnDef>;
}
export interface ColumnDef {
    name: string;
    colType: string;
}
export interface StockTransfer {
    to: string;
    from: string;
    quantity: bigint;
}
export interface InventoryItem {
    sku: string;
    businessId: string;
    purchaseRate: number;
    shop: bigint;
    minThreshold?: bigint;
    attributes: Array<[string, string]>;
    itemName: string;
    category: string;
    godowns: Array<GodownStock>;
    saleRate: number;
}
export interface Settings {
    biltyPrefixes: Array<string>;
    minStockThreshold: bigint;
    godowns: Array<string>;
}
export interface UserProfile {
    username: string;
    businessId: string;
    role: UserRole;
    isActive: boolean;
    registered: Time;
}
export interface Category {
    name: string;
    fields: Array<CategoryField>;
}
export enum UserRole {
    admin = "admin",
    supplier = "supplier",
    user = "user",
    guest = "guest"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string, fields: Array<CategoryField>): Promise<void>;
    addStock(sku: string, stockDelta: StockDelta): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCustomColumns(): Promise<CustomColumns>;
    getInventorySortedByPurchaseRate(): Promise<Array<InventoryItem>>;
    getInventorySortedBySaleRate(): Promise<Array<InventoryItem>>;
    getInventorySortedByShopStock(): Promise<Array<InventoryItem>>;
    getInventorySortedBySku(): Promise<Array<InventoryItem>>;
    getPendingParcels(): Promise<Array<PendingParcel>>;
    getSettings(): Promise<Settings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isRegistered(): Promise<boolean>;
    register(userPrincipal: Principal, username: string, businessId: string, role: UserRole): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCustomColumns(columns: CustomColumns): Promise<void>;
    setSettings(settings: Settings): Promise<void>;
    transferStock(transfer: StockTransfer): Promise<void>;
}
