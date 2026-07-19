/**
 * Product Types
 */

export type ProductStatus =
    | 'DRAFT'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'OUT_OF_STOCK'
    | 'DISCONTINUED';

export interface CategorySummary {
    id: string;
    name: string;
}

export interface BrandSummary {
    id: string;
    name: string;
}

export interface ProductResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    thumbnail: string;
    status: ProductStatus;
    category: CategorySummary;
    brand: BrandSummary | null;
    storeId: string;
    quantity: number;
    price: number;
    active: boolean;
    lowStockThreshold: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface ProductRequest {
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    status: ProductStatus;
    categoryId: string;
    brandId?: string;
    storeId: string;
    quantity: number;
    price: number;
    active?: boolean;
    lowStockThreshold?: number;
}

export interface InventoryUpdateRequest {
    quantity?: number;
    price?: number;
}

/**
 * Category Types
 */
export interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    parentId?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Brand Types
 */
export interface BrandResponse {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
