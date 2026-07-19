/**
 * Product Variant API Service
 */

import { api } from './client';
import type {
    ProductVariantResponse,
    ProductVariantRequest,
} from '@/types/variant';

export const variantApi = {
    /**
     * Get all variants for a product
     */
    getProductVariants: (productId: string) =>
        api.get<ProductVariantResponse[]>(
            `/api/v1/products/${productId}/variants`
        ),

    /**
     * Get single variant by ID
     */
    getVariant: (variantId: string) =>
        api.get<ProductVariantResponse>(`/api/v1/variants/${variantId}`),

    /**
     * Create new variant for a product
     */
    createVariant: (productId: string, data: ProductVariantRequest) =>
        api.post<ProductVariantResponse>(
            `/api/v1/products/${productId}/variants`,
            data
        ),

    /**
     * Update existing variant
     */
    updateVariant: (variantId: string, data: ProductVariantRequest) =>
        api.put<ProductVariantResponse>(`/api/v1/variants/${variantId}`, data),

    /**
     * Delete variant
     */
    deleteVariant: (variantId: string) =>
        api.delete<void>(`/api/v1/variants/${variantId}`),
};
