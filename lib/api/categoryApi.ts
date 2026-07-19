/**
 * Category API Service
 */

import { api, buildQueryString, Page } from './client';
import type { CategoryResponse } from '@/types/product';

export interface CategoryRequest {
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
}

export const categoryApi = {
    /**
     * Get all categories
     */
    getAllCategories: (params?: {
        page?: number;
        size?: number;
        active?: boolean;
    }) => {
        const query = buildQueryString({
            page: params?.page ?? 0,
            size: params?.size ?? 100, // Default large size for dropdowns
            active: params?.active,
        });
        return api.get<Page<CategoryResponse>>(`/api/v1/categories${query}`);
    },

    /**
     * Get single category
     */
    getCategory: (id: string) =>
        api.get<CategoryResponse>(`/api/v1/categories/${id}`),

    /**
     * Create new category
     */
    createCategory: (data: CategoryRequest) =>
        api.post<CategoryResponse>('/api/v1/categories', data),

    /**
     * Update existing category
     */
    updateCategory: (id: string, data: CategoryRequest) =>
        api.put<CategoryResponse>(`/api/v1/categories/${id}`, data),

    /**
     * Delete category
     */
    deleteCategory: (id: string) =>
        api.delete<void>(`/api/v1/categories/${id}`),
};
