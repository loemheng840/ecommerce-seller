import axios, { type InternalAxiosRequestConfig } from "axios";
import type {
    Coupon,
    CouponStatistics,
    CouponUsage,
    Order,
    Page,
    ProductListing,
    SalesChartData,
    SalesSummary,
    StockItem,
    StockSummary,
    Store,
    StorePerformanceAnalytics,
    StoreStatusHistory,
    TaxConfig,
    TaxRegistration,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MOCK_STORE_KEY = "seller_mock_store_state";
const MOCK_HISTORY_KEY = "seller_mock_store_history";
const MOCK_PRODUCT_LISTINGS_KEY = "seller_mock_product_listings";
const MOCK_ORDERS_KEY = "seller_mock_orders";
const MOCK_COUPONS_KEY = "seller_mock_coupons";
const MOCK_TAX_KEY = "seller_mock_tax";
const DEFAULT_OWNER_ID = "seller-demo-user";
const DEFAULT_STORE_ID = "store-001";

const defaultStore: Store = {
    id: DEFAULT_STORE_ID,
    name: "Aster & Oak",
    slug: "aster-oak",
    description: "A premium lifestyle boutique for handmade gifts, home decor, and everyday essentials.",
    logo: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=200&q=80",
    contactInfo: "+1 555 014 8214 • hello@asterandoak.example",
    email: "hello@asterandoak.example",
    phone: "+1 555 014 8214",
    address: "123 Market Street, Portland, OR 97205",
    status: "PENDING_APPROVAL",
    storeOwnerId: DEFAULT_OWNER_ID,
    createdAt: "2025-01-16T10:00:00.000Z",
    updatedAt: "2025-02-11T08:30:00.000Z",
};

const defaultProductListings: ProductListing[] = [
    {
        id: "listing-001",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        productId: "prod-001",
        productName: "Aster Ceramic Mug",
        productSlug: "aster-ceramic-mug",
        categoryName: "Home Decor",
        brandName: "Aster & Oak",
        quantity: 4,
        price: 38,
        active: true,
        lowStockThreshold: 5,
        isLowStock: true,
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80",
        createdAt: "2025-02-11T09:30:00.000Z",
        updatedAt: "2025-02-11T09:30:00.000Z",
    },
    {
        id: "listing-002",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        productId: "prod-002",
        productName: "Nordic Linen Throw",
        productSlug: "nordic-linen-throw",
        categoryName: "Household",
        brandName: "Aster & Oak",
        quantity: 12,
        price: 54,
        active: true,
        lowStockThreshold: 4,
        isLowStock: false,
        imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80",
        createdAt: "2025-02-11T09:31:00.000Z",
        updatedAt: "2025-02-11T09:31:00.000Z",
    },
    {
        id: "listing-003",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        productId: "prod-003",
        productName: "Sheaf Candle Set",
        productSlug: "sheaf-candle-set",
        categoryName: "Lifestyle",
        brandName: "Aster & Oak",
        quantity: 0,
        price: 29,
        active: true,
        lowStockThreshold: 2,
        isLowStock: true,
        imageUrl: "https://images.unsplash.com/photo-1602872029707-0b5d3d2f57d8?auto=format&fit=crop&w=400&q=80",
        createdAt: "2025-02-11T09:32:00.000Z",
        updatedAt: "2025-02-11T09:32:00.000Z",
    },
    {
        id: "listing-004",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        productId: "prod-004",
        productName: "Minimal Desk Lamp",
        productSlug: "minimal-desk-lamp",
        categoryName: "Office",
        brandName: "Aster & Oak",
        quantity: 8,
        price: 42,
        active: true,
        lowStockThreshold: 6,
        isLowStock: false,
        imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80",
        createdAt: "2025-02-11T09:33:00.000Z",
        updatedAt: "2025-02-11T09:33:00.000Z",
    },
];

const defaultOrders: Order[] = [
    {
        id: "order-001",
        orderNumber: "ORD-1001",
        customerName: "Mina Hall",
        customerEmail: "mina@example.com",
        status: "PROCESSING",
        totalAmount: 176.0,
        shippingAddress: "451 Pine Street, Portland, OR 97205",
        items: [
            { id: "order-item-001", productName: "Aster Ceramic Mug", quantity: 2, unitPrice: 38, totalPrice: 76, shipmentStatus: "PACKED" },
            { id: "order-item-002", productName: "Nordic Linen Throw", quantity: 1, unitPrice: 54, totalPrice: 54, shipmentStatus: "PENDING" },
            { id: "order-item-003", productName: "Minimal Desk Lamp", quantity: 1, unitPrice: 42, totalPrice: 42, shipmentStatus: "SHIPPED" },
        ],
        createdAt: "2025-02-12T12:00:00.000Z",
        updatedAt: "2025-02-12T12:30:00.000Z",
    },
    {
        id: "order-002",
        orderNumber: "ORD-1002",
        customerName: "Devon Reed",
        customerEmail: "devon@example.com",
        status: "SHIPPED",
        totalAmount: 92.0,
        shippingAddress: "182 Ash Avenue, Portland, OR 97205",
        items: [
            { id: "order-item-004", productName: "Sheaf Candle Set", quantity: 1, unitPrice: 29, totalPrice: 29, shipmentStatus: "IN_TRANSIT" },
            { id: "order-item-005", productName: "Aster Ceramic Mug", quantity: 1, unitPrice: 38, totalPrice: 38, shipmentStatus: "DELIVERED" },
            { id: "order-item-006", productName: "Nordic Linen Throw", quantity: 1, unitPrice: 54, totalPrice: 54, shipmentStatus: "SHIPPED" },
        ],
        createdAt: "2025-02-13T10:00:00.000Z",
        updatedAt: "2025-02-13T11:30:00.000Z",
    },
];

const defaultCoupons: Coupon[] = [
    {
        id: "coupon-001",
        code: "SAVE10",
        description: "10% storewide discount for new customers",
        type: "PERCENTAGE",
        status: "ACTIVE",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumOrderAmount: 50,
        usageLimit: 100,
        usageCount: 8,
        usedCount: 8,
        maxUsageCount: 100,
        startDate: "2025-02-01T00:00:00.000Z",
        endDate: "2025-12-31T00:00:00.000Z",
        expiresAt: "2025-12-31T00:00:00.000Z",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        firstPurchaseOnly: true,
        isActive: true,
        createdAt: "2025-02-01T00:00:00.000Z",
        updatedAt: "2025-02-11T00:00:00.000Z",
    },
    {
        id: "coupon-002",
        code: "FLAT15",
        description: "Fixed $15 off orders over $100",
        type: "FIXED_AMOUNT",
        status: "ACTIVE",
        discountType: "FIXED",
        discountValue: 15,
        minimumOrderAmount: 100,
        usageLimit: 50,
        usageCount: 3,
        usedCount: 3,
        maxUsageCount: 50,
        startDate: "2025-02-05T00:00:00.000Z",
        endDate: "2025-11-30T00:00:00.000Z",
        expiresAt: "2025-11-30T00:00:00.000Z",
        storeId: DEFAULT_STORE_ID,
        storeName: defaultStore.name,
        firstPurchaseOnly: false,
        isActive: true,
        createdAt: "2025-02-05T00:00:00.000Z",
        updatedAt: "2025-02-11T00:00:00.000Z",
    },
];

const defaultTaxConfig: TaxConfig = {
    storeId: DEFAULT_STORE_ID,
    pricingMode: "EXCLUSIVE",
    taxRate: 0.1,
    vatRate: 0.1,
    updatedAt: "2025-02-11T00:00:00.000Z",
};

const defaultTaxRegistration: TaxRegistration = {
    storeId: DEFAULT_STORE_ID,
    vatRegistered: true,
    tin: "US-123456789",
    taxId: "TAX-2025-0101",
    country: "US",
    updatedAt: "2025-02-11T00:00:00.000Z",
};

function getJwtSub(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const token = localStorage.getItem("access_token");
        if (!token) return DEFAULT_OWNER_ID;
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return (decoded.sub as string) ?? DEFAULT_OWNER_ID;
    } catch {
        return DEFAULT_OWNER_ID;
    }
}

function getStoredStores(): Store[] {
    if (typeof window === "undefined") return [defaultStore];

    try {
        const raw = window.localStorage.getItem(MOCK_STORE_KEY);
        if (!raw) {
            window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify([defaultStore]));
            return [defaultStore];
        }

        const parsed = JSON.parse(raw) as Store[];
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [defaultStore];
    } catch {
        return [defaultStore];
    }
}

function writeStoredStores(stores: Store[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(stores));
}

function getStoredHistory(storeId: string): StoreStatusHistory[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(MOCK_HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Record<string, StoreStatusHistory[]>;
        return parsed[storeId] ?? [];
    } catch {
        return [];
    }
}

function writeStoredHistory(storeId: string, history: StoreStatusHistory[]) {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(MOCK_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, StoreStatusHistory[]>) : {};
    parsed[storeId] = history;
    window.localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(parsed));
}

function getStoredListings(storeId?: string): ProductListing[] {
    if (typeof window === "undefined") return defaultProductListings.filter((listing) => !storeId || listing.storeId === storeId);

    try {
        const raw = window.localStorage.getItem(MOCK_PRODUCT_LISTINGS_KEY);
        if (!raw) {
            window.localStorage.setItem(MOCK_PRODUCT_LISTINGS_KEY, JSON.stringify(defaultProductListings));
            return defaultProductListings.filter((listing) => !storeId || listing.storeId === storeId);
        }

        const parsed = JSON.parse(raw) as ProductListing[];
        const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProductListings;
        return list.filter((listing) => !storeId || listing.storeId === storeId);
    } catch {
        return defaultProductListings.filter((listing) => !storeId || listing.storeId === storeId);
    }
}

function writeStoredListings(listings: ProductListing[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MOCK_PRODUCT_LISTINGS_KEY, JSON.stringify(listings));
}

function getStoredOrders(storeId?: string): Order[] {
    if (typeof window === "undefined") return defaultOrders.filter((order) => !storeId || order.id.startsWith(storeId));

    try {
        const raw = window.localStorage.getItem(MOCK_ORDERS_KEY);
        if (!raw) {
            window.localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(defaultOrders));
            return defaultOrders.filter((order) => !storeId || order.id.startsWith(storeId));
        }

        const parsed = JSON.parse(raw) as Order[];
        const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultOrders;
        return list.filter((order) => !storeId || order.id.startsWith(storeId));
    } catch {
        return defaultOrders.filter((order) => !storeId || order.id.startsWith(storeId));
    }
}

function writeStoredOrders(orders: Order[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

function getStoredCoupons(storeId?: string): Coupon[] {
    if (typeof window === "undefined") return defaultCoupons.filter((coupon) => !storeId || coupon.storeId === storeId);

    try {
        const raw = window.localStorage.getItem(MOCK_COUPONS_KEY);
        if (!raw) {
            window.localStorage.setItem(MOCK_COUPONS_KEY, JSON.stringify(defaultCoupons));
            return defaultCoupons.filter((coupon) => !storeId || coupon.storeId === storeId);
        }

        const parsed = JSON.parse(raw) as Coupon[];
        const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCoupons;
        return list.filter((coupon) => !storeId || coupon.storeId === storeId);
    } catch {
        return defaultCoupons.filter((coupon) => !storeId || coupon.storeId === storeId);
    }
}

function writeStoredCoupons(coupons: Coupon[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MOCK_COUPONS_KEY, JSON.stringify(coupons));
}

function getStoredTax(storeId: string): TaxConfig {
    if (typeof window === "undefined") return defaultTaxConfig;

    try {
        const raw = window.localStorage.getItem(MOCK_TAX_KEY);
        if (!raw) {
            window.localStorage.setItem(MOCK_TAX_KEY, JSON.stringify({ [storeId]: defaultTaxConfig }));
            return defaultTaxConfig;
        }

        const parsed = JSON.parse(raw) as Record<string, TaxConfig>;
        return parsed[storeId] ?? defaultTaxConfig;
    } catch {
        return defaultTaxConfig;
    }
}

function writeStoredTax(storeId: string, tax: TaxConfig) {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(MOCK_TAX_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, TaxConfig>) : {};
    parsed[storeId] = tax;
    window.localStorage.setItem(MOCK_TAX_KEY, JSON.stringify(parsed));
}

function createHistoryEntry(storeId: string, previousStatus: Store["status"], newStatus: Store["status"], reason?: string): StoreStatusHistory {
    return {
        id: `${storeId}-history-${Date.now()}`,
        storeId,
        previousStatus,
        newStatus,
        reason,
        changedAt: new Date().toISOString(),
    };
}

function pageResponse<T>(items: T[]): Page<T> {
    return {
        content: items,
        totalElements: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / Math.max(items.length, 1))),
        number: 0,
        size: items.length,
        first: true,
        last: true,
    };
}

function buildStockItems(storeId: string): StockItem[] {
    return getStoredListings(storeId).map((listing) => ({
        id: listing.id,
        productId: listing.productId,
        productName: listing.productName,
        variantName: listing.brandName,
        quantity: listing.quantity,
        lowStockThreshold: listing.lowStockThreshold,
        isLowStock: listing.quantity <= listing.lowStockThreshold,
        lastUpdated: listing.updatedAt,
    }));
}

function buildStockSummary(storeId: string): StockSummary {
    const items = buildStockItems(storeId);
    const totalListings = items.length;
    const lowStockCount = items.filter((item) => item.isLowStock).length;
    const outOfStockCount = items.filter((item) => item.quantity === 0).length;
    const totalInventoryValue = items.reduce((sum, item) => {
        const listing = getStoredListings(storeId).find((entry) => entry.id === item.id);
        return sum + (listing?.price ?? 0) * item.quantity;
    }, 0);

    return {
        totalListings,
        lowStockCount,
        outOfStockCount,
        totalInventoryValue,
    };
}

function buildSalesSummary(storeId: string): SalesSummary {
    const orders = getStoredOrders(storeId);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue: avgOrderValue,
        revenueChange: 8.2,
        ordersChange: 6.4,
    };
}

function buildSalesTrend(storeId: string): SalesChartData[] {
    const orders = getStoredOrders(storeId);
    const trend = [
        { date: "Mon", revenue: 0, orders: 0 },
        { date: "Tue", revenue: 0, orders: 0 },
        { date: "Wed", revenue: 0, orders: 0 },
        { date: "Thu", revenue: 0, orders: 0 },
        { date: "Fri", revenue: 0, orders: 0 },
        { date: "Sat", revenue: 0, orders: 0 },
        { date: "Sun", revenue: 0, orders: 0 },
    ];

    return trend.map((entry, idx) => ({
        ...entry,
        revenue: orders.reduce((sum, order) => {
            const day = new Date(order.createdAt).getDay();
            return day === ((idx + 1) % 7) ? sum + order.totalAmount : sum;
        }, 0),
        orders: orders.filter((order) => new Date(order.createdAt).getDay() === ((idx + 1) % 7)).length,
    }));
}

function buildAnalytics(storeId: string): StorePerformanceAnalytics {
    const summary = buildSalesSummary(storeId);
    return {
        revenue: summary.totalRevenue,
        orders: summary.totalOrders,
        averageOrderValue: summary.averageOrderValue,
        conversionRate: 4.8,
        visitingCustomers: 142,
        topSellingProducts: [
            { productName: "Aster Ceramic Mug", revenue: 152, quantity: 4 },
            { productName: "Nordic Linen Throw", revenue: 108, quantity: 2 },
            { productName: "Minimal Desk Lamp", revenue: 84, quantity: 2 },
        ],
    };
}

function isStoreEndpoint(url: string) {
    return url.startsWith("/api/v1/stores") || url.startsWith("api/v1/stores") || url.startsWith("/api/v1/stock") || url.startsWith("api/v1/stock") || url.startsWith("/api/v1/reports") || url.startsWith("api/v1/reports");
}

function isPublicCouponEndpoint(url: string) {
    return url.match(/\/api\/v1\/stores\/[^/]+\/coupons\/available$/);
}

const mockStoreAdapter = async (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Mock adapter only available in browser runtime"));
    }

    const url = config.url ?? "";
    const method = (config.method ?? "get").toLowerCase();
    const ownerId = getJwtSub();
    const stores = getStoredStores();
    const historyMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/audit-history$/);
    if (historyMatch && method === "get") {
        const storeIdParam = historyMatch[1];
        const history = getStoredHistory(storeIdParam);
        return { data: history, status: 200, statusText: "OK", headers: {}, config };
    }

    const ownerMatch = url.match(/\/api\/v1\/stores\/owner\/([^/]+)$/);
    if (ownerMatch && method === "get") {
        const filtered = stores.filter((s) => !ownerId || s.storeOwnerId === ownerId || !s.storeOwnerId);
        return { data: filtered, status: 200, statusText: "OK", headers: {}, config };
    }

    const listMatch = url.match(/\/api\/v1\/stores$/);
    if (listMatch && method === "get") {
        const filtered = stores.filter((s) => !ownerId || s.storeOwnerId === ownerId || !s.storeOwnerId);
        return { data: pageResponse(filtered), status: 200, statusText: "OK", headers: {}, config };
    }

    const storeMatch = url.match(/\/api\/v1\/stores\/([^/]+)$/);
    if (storeMatch && method === "get") {
        const storeIdParam = storeMatch[1];
        const found = stores.find((store) => store.id === storeIdParam);
        if (!found) {
            return Promise.reject({ response: { status: 404, data: { message: "Store not found." } } });
        }
        return { data: found, status: 200, statusText: "OK", headers: {}, config };
    }

    if (storeMatch && method === "put") {
        const storeIdParam = storeMatch[1];
        const current = stores.find((store) => store.id === storeIdParam);
        if (!current) {
            return Promise.reject({ response: { status: 404, data: { message: "Store not found." } } });
        }

        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<Store>;
        const updated: Store = {
            ...current,
            name: payload.name ?? current.name,
            slug: payload.slug ?? current.slug,
            description: payload.description ?? current.description,
            contactInfo: payload.contactInfo ?? current.contactInfo,
            email: payload.email ?? current.email,
            phone: payload.phone ?? current.phone,
            address: payload.address ?? current.address,
            updatedAt: new Date().toISOString(),
        };

        const nextStores = stores.map((store) => (store.id === storeIdParam ? updated : store));
        writeStoredStores(nextStores);
        const history = getStoredHistory(storeIdParam);
        writeStoredHistory(storeIdParam, [createHistoryEntry(storeIdParam, current.status, updated.status, "Store profile updated."), ...history]);
        return { data: updated, status: 200, statusText: "OK", headers: {}, config };
    }

    if (listMatch && method === "post") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<Store>;
        const owner = getJwtSub() ?? DEFAULT_OWNER_ID;
        const created: Store = {
            id: `store-${Date.now()}`,
            name: payload.name ?? "My Store",
            slug: payload.slug ?? "my-store",
            description: payload.description ?? "Mock store created for seller onboarding.",
            contactInfo: payload.contactInfo ?? payload.email ?? payload.phone ?? payload.address ?? "",
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            status: "PENDING_APPROVAL",
            storeOwnerId: owner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nextStores = [created, ...stores];
        writeStoredStores(nextStores);
        writeStoredHistory(created.id, [createHistoryEntry(created.id, "INACTIVE", created.status, "Store submission received.")]);
        return { data: created, status: 201, statusText: "Created", headers: {}, config };
    }

    if (storeMatch && method === "delete") {
        const storeIdParam = storeMatch[1];
        const remaining = stores.filter((store) => store.id !== storeIdParam);
        writeStoredStores(remaining);
        return { data: null, status: 204, statusText: "No Content", headers: {}, config };
    }

    const listingListMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/products$/);
    if (listingListMatch && method === "get") {
        const listings = getStoredListings(listingListMatch[1]);
        return { data: pageResponse(listings), status: 200, statusText: "OK", headers: {}, config };
    }

    if (listingListMatch && method === "post") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as ProductListing;
        const next: ProductListing = {
            id: `listing-${Date.now()}`,
            storeId: listingListMatch[1],
            storeName: stores.find((entry) => entry.id === listingListMatch[1])?.name ?? "Mock Store",
            productId: payload.productId,
            productName: payload.productName || `Product ${Date.now()}`,
            productSlug: payload.productSlug || payload.productName?.toLowerCase().replace(/\s+/g, "-") || "product",
            quantity: payload.quantity,
            price: payload.price,
            active: payload.active ?? true,
            lowStockThreshold: payload.lowStockThreshold ?? 5,
            imageUrl: payload.imageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const listings = getStoredListings();
        writeStoredListings([next, ...listings]);
        return { data: next, status: 201, statusText: "Created", headers: {}, config };
    }

    const listingDetailMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/products\/([^/]+)$/);
    if (listingDetailMatch && method === "get") {
        const [, storeIdParam, listingId] = listingDetailMatch;
        const found = getStoredListings(storeIdParam).find((item) => item.id === listingId || item.productId === listingId);
        if (!found) {
            return Promise.reject({ response: { status: 404, data: { message: "Listing not found." } } });
        }
        return { data: found, status: 200, statusText: "OK", headers: {}, config };
    }

    if (listingDetailMatch && method === "put") {
        const [, storeIdParam, listingId] = listingDetailMatch;
        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<ProductListing>;
        const listings = getStoredListings();
        const current = listings.find((item) => item.storeId === storeIdParam && (item.id === listingId || item.productId === listingId));
        if (!current) {
            return Promise.reject({ response: { status: 404, data: { message: "Listing not found." } } });
        }
        const updated: ProductListing = {
            ...current,
            quantity: payload.quantity ?? current.quantity,
            price: payload.price ?? current.price,
            active: payload.active ?? current.active,
            lowStockThreshold: payload.lowStockThreshold ?? current.lowStockThreshold,
            updatedAt: new Date().toISOString(),
        };
        const next = listings.map((item) => item.id === current.id ? updated : item);
        writeStoredListings(next);
        return { data: updated, status: 200, statusText: "OK", headers: {}, config };
    }

    if (listingDetailMatch && method === "delete") {
        const [, storeIdParam, listingId] = listingDetailMatch;
        const listings = getStoredListings().filter((item) => !(item.storeId === storeIdParam && (item.id === listingId || item.productId === listingId)));
        writeStoredListings(listings);
        return { data: null, status: 204, statusText: "No Content", headers: {}, config };
    }

    const lowStockMatch = url.match(/\/api\/v1\/stock\/stores\/([^/]+)\/low-stock$/);
    if (lowStockMatch && method === "get") {
        const items = buildStockItems(lowStockMatch[1]).filter((item) => item.isLowStock);
        return { data: pageResponse(items), status: 200, statusText: "OK", headers: {}, config };
    }

    const outOfStockMatch = url.match(/\/api\/v1\/stock\/stores\/([^/]+)\/out-of-stock$/);
    if (outOfStockMatch && method === "get") {
        const items = buildStockItems(outOfStockMatch[1]).filter((item) => item.quantity === 0);
        return { data: pageResponse(items), status: 200, statusText: "OK", headers: {}, config };
    }

    const totalInventoryMatch = url.match(/\/api\/v1\/stock\/stores\/([^/]+)\/total-inventory-value$/);
    if (totalInventoryMatch && method === "get") {
        return { data: buildStockSummary(totalInventoryMatch[1]), status: 200, statusText: "OK", headers: {}, config };
    }

    const lowStockCountMatch = url.match(/\/api\/v1\/stock\/stores\/([^/]+)\/low-stock\/count$/);
    if (lowStockCountMatch && method === "get") {
        const count = buildStockItems(lowStockCountMatch[1]).filter((item) => item.isLowStock).length;
        return { data: { count }, status: 200, statusText: "OK", headers: {}, config };
    }

    const outOfStockCountMatch = url.match(/\/api\/v1\/stock\/stores\/([^/]+)\/out-of-stock\/count$/);
    if (outOfStockCountMatch && method === "get") {
        const count = buildStockItems(outOfStockCountMatch[1]).filter((item) => item.quantity === 0).length;
        return { data: { count }, status: 200, statusText: "OK", headers: {}, config };
    }

    const availableQuantityMatch = url.match(/\/api\/v1\/stock\/listings\/([^/]+)\/available-quantity$/);
    if (availableQuantityMatch && method === "get") {
        const listing = getStoredListings().find((item) => item.id === availableQuantityMatch[1]);
        return { data: { listingId: availableQuantityMatch[1], availableQuantity: listing?.quantity ?? 0 }, status: 200, statusText: "OK", headers: {}, config };
    }

    const ordersListMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/orders$/);
    if (ordersListMatch && method === "get") {
        const orders = getStoredOrders(ordersListMatch[1]);
        return { data: pageResponse(orders), status: 200, statusText: "OK", headers: {}, config };
    }

    const orderDetailMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/orders\/([^/]+)$/);
    if (orderDetailMatch && method === "get") {
        const [, storeIdParam, orderId] = orderDetailMatch;
        const order = getStoredOrders(storeIdParam).find((entry) => entry.id === orderId);
        if (!order) {
            return Promise.reject({ response: { status: 404, data: { message: "Order not found." } } });
        }
        return { data: order, status: 200, statusText: "OK", headers: {}, config };
    }

    const orderItemsMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/orders\/([^/]+)\/items$/);
    if (orderItemsMatch && method === "get") {
        const [, storeIdParam, orderId] = orderItemsMatch;
        const order = getStoredOrders(storeIdParam).find((entry) => entry.id === orderId);
        if (!order) {
            return Promise.reject({ response: { status: 404, data: { message: "Order not found." } } });
        }
        return { data: order.items, status: 200, statusText: "OK", headers: {}, config };
    }

    const shipmentUpdateMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/orders\/([^/]+)\/items\/([^/]+)\/shipment-status$/);
    if (shipmentUpdateMatch && method === "put") {
        const [, storeIdParam, orderId, itemId] = shipmentUpdateMatch;
        const orders = getStoredOrders(storeIdParam);
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
            return Promise.reject({ response: { status: 404, data: { message: "Order not found." } } });
        }
        const payload = (config.data ? JSON.parse(config.data) : {}) as { shipmentStatus?: string };
        order.items = order.items.map((item) => item.id === itemId ? { ...item, shipmentStatus: (payload.shipmentStatus ?? item.shipmentStatus) as Order["items"][number]["shipmentStatus"] } : item);
        writeStoredOrders(orders);
        return { data: order, status: 200, statusText: "OK", headers: {}, config };
    }

    const couponsMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/coupons$/);
    if (couponsMatch && method === "get") {
        const coupons = getStoredCoupons(couponsMatch[1]);
        return { data: pageResponse(coupons), status: 200, statusText: "OK", headers: {}, config };
    }

    if (couponsMatch && method === "post") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as Coupon;
        const coupon: Coupon = {
            id: `coupon-${Date.now()}`,
            code: payload.code,
            description: payload.description,
            type: payload.type,
            status: payload.isActive === false ? "INACTIVE" : "ACTIVE",
            discountType: payload.discountType ?? (payload.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED"),
            discountValue: payload.discountValue,
            minimumOrderAmount: payload.minimumOrderAmount,
            maximumDiscountAmount: payload.maximumDiscountAmount,
            usageLimit: payload.usageLimit,
            usageLimitPerUser: payload.usageLimitPerUser,
            usageCount: payload.usageCount ?? 0,
            usedCount: payload.usedCount ?? 0,
            maxUsageCount: payload.maxUsageCount ?? payload.usageLimit,
            startDate: payload.startDate,
            endDate: payload.endDate,
            expiresAt: payload.expiresAt ?? payload.endDate,
            storeId: couponsMatch[1],
            storeName: stores.find((entry) => entry.id === couponsMatch[1])?.name ?? "Mock Store",
            firstPurchaseOnly: payload.firstPurchaseOnly ?? false,
            isActive: payload.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const coupons = [coupon, ...getStoredCoupons(couponsMatch[1])];
        writeStoredCoupons(coupons);
        return { data: coupon, status: 201, statusText: "Created", headers: {}, config };
    }

    const couponDetailMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/coupons\/([^/]+)$/);
    if (couponDetailMatch && method === "put") {
        const [, storeIdParam, couponId] = couponDetailMatch;
        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<Coupon>;
        const coupons = getStoredCoupons(storeIdParam);
        const found = coupons.find((coupon) => coupon.id === couponId);
        if (!found) {
            return Promise.reject({ response: { status: 404, data: { message: "Coupon not found." } } });
        }
        const updated: Coupon = {
            ...found,
            code: payload.code ?? found.code,
            description: payload.description ?? found.description,
            discountType: payload.discountType ?? found.discountType,
            discountValue: payload.discountValue ?? found.discountValue,
            minimumOrderAmount: payload.minimumOrderAmount ?? found.minimumOrderAmount,
            maximumDiscountAmount: payload.maximumDiscountAmount ?? found.maximumDiscountAmount,
            usageLimit: payload.usageLimit ?? found.usageLimit,
            usageLimitPerUser: payload.usageLimitPerUser ?? found.usageLimitPerUser,
            startDate: payload.startDate ?? found.startDate,
            endDate: payload.endDate ?? found.endDate,
            firstPurchaseOnly: payload.firstPurchaseOnly ?? found.firstPurchaseOnly,
            updatedAt: new Date().toISOString(),
        };
        writeStoredCoupons(coupons.map((coupon) => coupon.id === couponId ? updated : coupon));
        return { data: updated, status: 200, statusText: "OK", headers: {}, config };
    }

    if (couponDetailMatch && method === "delete") {
        const [, storeIdParam, couponId] = couponDetailMatch;
        const coupons = getStoredCoupons(storeIdParam).filter((coupon) => coupon.id !== couponId);
        writeStoredCoupons(coupons);
        return { data: null, status: 204, statusText: "No Content", headers: {}, config };
    }

    const couponStatusMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/coupons\/([^/]+)\/status$/);
    if (couponStatusMatch && method === "patch") {
        const [, storeIdParam, couponId] = couponStatusMatch;
        const active = new URLSearchParams(config.url?.split("?")[1] ?? "").get("active") === "true";
        const coupons = getStoredCoupons(storeIdParam);
        const found = coupons.find((coupon) => coupon.id === couponId);
        if (!found) {
            return Promise.reject({ response: { status: 404, data: { message: "Coupon not found." } } });
        }
        const updated = { ...found, isActive: active, status: active ? "ACTIVE" : "INACTIVE" };
        writeStoredCoupons(coupons.map((coupon) => coupon.id === couponId ? updated : coupon));
        return { data: updated, status: 200, statusText: "OK", headers: {}, config };
    }

    const couponUsagesMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/coupons\/([^/]+)\/usages$/);
    if (couponUsagesMatch && method === "get") {
        const usages: CouponUsage[] = [
            { id: "usage-001", couponId: couponUsagesMatch[2], userId: "user-001", orderId: "order-001", discountAmount: 10, usedAt: "2025-02-12T10:00:00.000Z" },
            { id: "usage-002", couponId: couponUsagesMatch[2], userId: "user-002", orderId: "order-002", discountAmount: 15, usedAt: "2025-02-13T11:00:00.000Z" },
        ];
        return { data: pageResponse(usages), status: 200, statusText: "OK", headers: {}, config };
    }

    const couponStatisticsMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/coupons\/([^/]+)\/statistics$/);
    if (couponStatisticsMatch && method === "get") {
        const stats: CouponStatistics = {
            couponId: couponStatisticsMatch[2],
            couponCode: "SAVE10",
            totalUsageCount: 8,
            totalDiscountGiven: 80,
            uniqueUsers: 7,
        };
        return { data: stats, status: 200, statusText: "OK", headers: {}, config };
    }

    if (isPublicCouponEndpoint(url) && method === "get") {
        return { data: pageResponse(getStoredCoupons(DEFAULT_STORE_ID)), status: 200, statusText: "OK", headers: {}, config };
    }

    const dashboardMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/sales\/dashboard$/);
    if (dashboardMatch && method === "get") {
        const summary = buildSalesSummary(dashboardMatch[1]);
        return { data: summary, status: 200, statusText: "OK", headers: {}, config };
    }

    const dailyTrendMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/sales\/daily-trend$/);
    if (dailyTrendMatch && method === "get") {
        return { data: buildSalesTrend(dailyTrendMatch[1]), status: 200, statusText: "OK", headers: {}, config };
    }

    const byProductMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/sales\/by-product$/);
    if (byProductMatch && method === "get") {
        return { data: [
            { productName: "Aster Ceramic Mug", revenue: 152, quantity: 4 },
            { productName: "Nordic Linen Throw", revenue: 108, quantity: 2 },
            { productName: "Minimal Desk Lamp", revenue: 84, quantity: 2 },
        ], status: 200, statusText: "OK", headers: {}, config };
    }

    const topProductsMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/sales\/top-products$/);
    if (topProductsMatch && method === "get") {
        return { data: [
            { productName: "Aster Ceramic Mug", revenue: 152, quantity: 4 },
            { productName: "Nordic Linen Throw", revenue: 108, quantity: 2 },
        ], status: 200, statusText: "OK", headers: {}, config };
    }

    const orderReportMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/orders$/);
    if (orderReportMatch && method === "get") {
        return { data: pageResponse(getStoredOrders(orderReportMatch[1])), status: 200, statusText: "OK", headers: {}, config };
    }

    const orderSummaryMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/orders\/summary$/);
    if (orderSummaryMatch && method === "get") {
        const orders = getStoredOrders(orderSummaryMatch[1]);
        const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { data: { totalOrders: orders.length, pendingOrders: 1, completedOrders: 2, revenue }, status: 200, statusText: "OK", headers: {}, config };
    }

    const inventoryMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/inventory$/);
    if (inventoryMatch && method === "get") {
        return { data: buildStockSummary(inventoryMatch[1]), status: 200, statusText: "OK", headers: {}, config };
    }

    const lowStockReportMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/inventory\/low-stock$/);
    if (lowStockReportMatch && method === "get") {
        return { data: pageResponse(buildStockItems(lowStockReportMatch[1]).filter((item) => item.isLowStock)), status: 200, statusText: "OK", headers: {}, config };
    }

    const outOfStockReportMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/inventory\/out-of-stock$/);
    if (outOfStockReportMatch && method === "get") {
        return { data: pageResponse(buildStockItems(outOfStockReportMatch[1]).filter((item) => item.quantity === 0)), status: 200, statusText: "OK", headers: {}, config };
    }

    const inventorySummaryMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/inventory\/summary$/);
    if (inventorySummaryMatch && method === "get") {
        return { data: buildStockSummary(inventorySummaryMatch[1]), status: 200, statusText: "OK", headers: {}, config };
    }

    const analyticsMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/analytics$/);
    if (analyticsMatch && method === "get") {
        return { data: buildAnalytics(analyticsMatch[1]), status: 200, statusText: "OK", headers: {}, config };
    }

    const vatMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/vat-registration$/);
    if (vatMatch && method === "get") {
        return { data: defaultTaxRegistration, status: 200, statusText: "OK", headers: {}, config };
    }

    if (vatMatch && method === "put") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<TaxRegistration>;
        const tax = {
            ...defaultTaxRegistration,
            ...payload,
            storeId: vatMatch[1],
            updatedAt: new Date().toISOString(),
        };
        return { data: tax, status: 200, statusText: "OK", headers: {}, config };
    }

    const taxConfigMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/tax-config$/);
    if (taxConfigMatch && method === "put") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as Partial<TaxConfig>;
        const next = { ...getStoredTax(taxConfigMatch[1]), ...payload, storeId: taxConfigMatch[1], updatedAt: new Date().toISOString() };
        writeStoredTax(taxConfigMatch[1], next);
        return { data: next, status: 200, statusText: "OK", headers: {}, config };
    }

    const pricingModeMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/tax-config\/pricing-mode$/);
    if (pricingModeMatch && method === "put") {
        const payload = (config.data ? JSON.parse(config.data) : {}) as { pricingMode?: TaxConfig["pricingMode"] };
        const current = getStoredTax(pricingModeMatch[1]);
        const next = { ...current, pricingMode: payload.pricingMode ?? current.pricingMode, updatedAt: new Date().toISOString() };
        writeStoredTax(pricingModeMatch[1], next);
        return { data: next, status: 200, statusText: "OK", headers: {}, config };
    }

    const taxSummaryMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/tax$/);
    if (taxSummaryMatch && method === "get") {
        return { data: { totalTax: 124.5, taxableRevenue: 1245.0, vatCollected: 124.5 }, status: 200, statusText: "OK", headers: {}, config };
    }

    const taxDetailedMatch = url.match(/\/api\/v1\/stores\/([^/]+)\/reports\/tax\/detailed$/);
    if (taxDetailedMatch && method === "get") {
        return { data: [
            { label: "VAT", amount: 124.5 },
            { label: "Sales tax", amount: 65.3 },
            { label: "Shipping tax", amount: 12.1 },
        ], status: 200, statusText: "OK", headers: {}, config };
    }

    if (url.includes("/reports/export/")) {
        return { data: { downloadUrl: `/mock-download/${Date.now()}.csv`, message: "Mock export generated." }, status: 200, statusText: "OK", headers: {}, config };
    }

    return Promise.reject({
        response: {
            status: 400,
            data: { message: `Mock adapter does not handle ${method.toUpperCase()} ${url}.` },
        },
    });
};

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    if (typeof window !== "undefined" && isStoreEndpoint(config.url ?? "")) {
        config.adapter = mockStoreAdapter;
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
