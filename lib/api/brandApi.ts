/**
 * Brand API Service
 */

import { api, buildQueryString, Page } from './client';
import type { BrandResponse } from '@/types/product';

export interface BrandRequest {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    active?: boolean;
}

export const brandApi = {
    /**
     * Get all brands
     */
    getAllBrands: (params?: {
        page?: number;
        size?: number;
        active?: boolean;
    }) => {
        const query = buildQueryString({
            page: params?.page ?? 0,
            size: params?.size ?? 100, // Default large size for dropdowns
            active: params?.active,
        });
        return api.get<Page<BrandResponse>>(`/api/v1/brands${query}`);
    },

    /**
     * Get single brand
     */
    getBrand: (id: string) =>
        api.get<BrandResponse>(`/api/v1/brands/${id}`),

    /**
     * Create new brand
     */
    createBrand: (data: BrandRequest) =>
        api.post<BrandResponse>('/api/v1/brands', data),

    /**
     * Update existing brand
     */
    updateBrand: (id: string, data: BrandRequest) =>
        api.put<BrandResponse>(`/api/v1/brands/${id}`, data),

    /**
     * Delete brand
     */
    deleteBrand: (id: string) =>
        api.delete<void>(`/api/v1/brands/${id}`),
};
