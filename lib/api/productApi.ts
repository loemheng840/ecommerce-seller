/**
 * Product API Service
 */

import { api, buildQueryString, Page } from './client';
import type {
    ProductResponse,
    ProductRequest,
    InventoryUpdateRequest,
    ProductStatus,
} from '@/types/product';

export const productApi = {
    /**
     * Get products by store with pagination and filters
     */
    getStoreProducts: (
        storeId: string,
        params?: {
            page?: number;
            size?: number;
            status?: ProductStatus;
            categoryId?: string;
            brandId?: string;
            keyword?: string;
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
        }
    ) => {
        const query = buildQueryString({
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            status: params?.status,
            categoryId: params?.categoryId,
            brandId: params?.brandId,
            keyword: params?.keyword,
            minPrice: params?.minPrice,
            maxPrice: params?.maxPrice,
            sort: params?.sort,
        });
        return api.get<Page<ProductResponse>>(
            `/api/v1/products/by-store/${storeId}${query}`
        );
    },

    /**
     * Get single product by ID
     */
    getProduct: (id: string) =>
        api.get<ProductResponse>(`/api/v1/products/${id}`),

    /**
     * Get product by slug
     */
    getProductBySlug: (slug: string) =>
        api.get<ProductResponse>(`/api/v1/products/slug/${slug}`),

    /**
     * Create new product
     */
    createProduct: (data: ProductRequest) =>
        api.post<ProductResponse>('/api/v1/products', data),

    /**
     * Update existing product
     */
    updateProduct: (id: string, data: ProductRequest) =>
        api.put<ProductResponse>(`/api/v1/products/${id}`, data),

    /**
     * Quick inventory update (quantity and/or price)
     */
    updateInventory: (id: string, data: InventoryUpdateRequest) =>
        api.patch<ProductResponse>(`/api/v1/products/${id}/inventory`, data),

    /**
     * Delete product
     */
    deleteProduct: (id: string) =>
        api.delete<void>(`/api/v1/products/${id}`),

    /**
     * Get all products with filters (public endpoint)
     */
    getAllProducts: (params?: {
        page?: number;
        size?: number;
        status?: ProductStatus;
        categoryId?: string;
        brandId?: string;
        keyword?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
    }) => {
        const query = buildQueryString({
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            ...params,
        });
        return api.get<Page<ProductResponse>>(`/api/v1/products${query}`);
    },
};
