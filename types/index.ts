// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export type StoreStatus =
    | "PENDING_APPROVAL"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED"
    | "INACTIVE";

export interface Store {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo?: string;
    contactInfo?: string;
    email?: string;
    phone?: string;
    address?: string;
    status: StoreStatus;
    storeOwnerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StoreStatusHistory {
    id: string;
    storeId: string;
    previousStatus: StoreStatus;
    newStatus: StoreStatus;
    reason?: string;
    changedAt: string;
}

export interface StoreCreateRequest {
    name: string;
    slug: string;
    description: string;
    contactInfo?: string;
}

export type StoreUpdateRequest = StoreCreateRequest;

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductStatus =
    | "DRAFT"
    | "ACTIVE"
    | "INACTIVE"
    | "OUT_OF_STOCK"
    | "DISCONTINUED";

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    status: ProductStatus;
    category?: Category;
    brand?: Brand;
    imageUrls?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    status: ProductStatus;
    categoryId: string;
    brandId: string;
}

// ─── Product Listing (Store Inventory) ────────────────────────────────────────
export interface ProductListing {
    id: string;
    storeId: string;
    storeName?: string;
    productId: string;
    productName: string;
    productSlug?: string;
    categoryName?: string;
    brandName?: string;
    quantity: number;
    price: number;
    active: boolean;
    lowStockThreshold: number;
    isLowStock?: boolean;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductListingRequest {
    productId: string;
    quantity: number;
    price: number;
    lowStockThreshold?: number;
    active?: boolean;
}

export interface ProductListingUpdateRequest {
    quantity?: number;
    price?: number;
    lowStockThreshold?: number;
    active?: boolean;
}

// ─── Stock ───────────────────────────────────────────────────────────────────
export interface StockItem {
    id: string;
    productId: string;
    productName: string;
    variantName?: string;
    quantity: number;
    lowStockThreshold: number;
    isLowStock: boolean;
    lastUpdated: string;
}

export interface StockSummary {
    totalListings: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
export type ShipmentStatus =
    | "PENDING"
    | "PACKED"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "RETURNED";

export interface OrderItem {
    id: string;
    productName: string;
    productImageUrl?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    shipmentStatus: ShipmentStatus;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    shippingAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderDashboardSummary {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue: number;
}

// ─── Coupon ──────────────────────────────────────────────────────────────────
export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DEPLETED";
export type DiscountType = "PERCENTAGE" | "FIXED"; // legacy alias

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    type: CouponType;
    status: CouponStatus;
    discountType?: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    usageCount: number;
    usedCount?: number;
    maxUsageCount?: number;
    startDate: string;
    endDate: string;
    expiresAt?: string;
    storeId?: string;
    storeName?: string;
    firstPurchaseOnly: boolean;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CouponCreateRequest {
    code: string;
    description?: string;
    type: CouponType;
    discountType?: DiscountType;
    discountValue: string;
    minimumOrderAmount?: string;
    maximumDiscountAmount?: string;
    usageLimit?: string;
    usageLimitPerUser?: string;
    startDate: string;
    endDate: string;
    firstPurchaseOnly?: boolean;
}

export type CouponUpdateRequest = CouponCreateRequest;

export interface CouponStatistics {
    couponId: string;
    couponCode: string;
    totalUsageCount: number;
    totalDiscountGiven: number;
    uniqueUsers: number;
}

export interface CouponUsage {
    id: string;
    couponId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    usedAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
    id: string;
    productId: string;
    productName: string;
    customerName: string;
    rating: number;
    comment?: string;
    reply?: string;
    createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface SalesSummary {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueChange: number;
    ordersChange: number;
}

export interface SalesChartData {
    date: string;
    revenue: number;
    orders: number;
}

export interface StorePerformanceAnalytics {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    conversionRate: number;
    visitingCustomers: number;
    topSellingProducts: Array<{ productName: string; revenue: number; quantity: number }>;
}

export interface StoreSalesReport {
    summary: SalesSummary;
    dailyTrend: SalesChartData[];
    byProduct: Array<{ productName: string; revenue: number; quantity: number }>;
    topProducts: Array<{ productName: string; revenue: number; quantity: number }>;
}

export interface InventoryReportMetric {
    totalListings: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
}

export interface TaxRegistration {
    storeId: string;
    vatRegistered: boolean;
    tin: string;
    taxId: string;
    country: string;
    updatedAt: string;
}

export interface TaxConfig {
    storeId: string;
    pricingMode: "INCLUSIVE" | "EXCLUSIVE";
    taxRate: number;
    vatRate: number;
    updatedAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = "ORDER" | "STOCK" | "STORE" | "REVIEW" | "SYSTEM";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
