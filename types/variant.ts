/**
 * Product Variant Types
 */

export interface ProductVariantResponse {
    id: string;
    productId: string;
    sku: string;
    barcode?: string;
    price: number;
    salePrice?: number;
    costPrice?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    status: boolean;
    attributeValueIds: string[];
}

export interface ProductVariantRequest {
    productId: string;
    sku: string;
    barcode?: string;
    price: number;
    salePrice?: number;
    costPrice?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    status: boolean;
    attributeValueIds: string[];
}

/**
 * Helper type for variant with attribute names
 */
export interface ProductVariantWithAttributes extends ProductVariantResponse {
    attributes: {
        attributeName: string;
        value: string;
    }[];
}
