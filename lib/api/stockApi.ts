/**
 * Stock & Inventory API Service
 */

import { api } from './client';
import type { ProductResponse } from '@/types/product';

export const stockApi = {
    /**
     * Get available quantity for a product
     */
    getAvailableQuantity: (productId: string) =>
        api.get<number>(`/api/v1/stock/products/${productId}/available-quantity`),

    /**
     * Get low stock products for a store
     */
    getLowStockProducts: (storeId: string) =>
        api.get<ProductResponse[]>(`/api/v1/stock/stores/${storeId}/low-stock`),

    /**
     * Get out of stock products for a store
     */
    getOutOfStockProducts: (storeId: string) =>
        api.get<ProductResponse[]>(`/api/v1/stock/stores/${storeId}/out-of-stock`),

    /**
     * Get total inventory value for a store
     */
    getTotalInventoryValue: (storeId: string) =>
        api.get<number>(`/api/v1/stock/stores/${storeId}/total-inventory-value`),

    /**
     * Count low stock products
     */
    getLowStockCount: (storeId: string) =>
        api.get<number>(`/api/v1/stock/stores/${storeId}/low-stock/count`),

    /**
     * Count out of stock products
     */
    getOutOfStockCount: (storeId: string) =>
        api.get<number>(`/api/v1/stock/stores/${storeId}/out-of-stock/count`),
};
