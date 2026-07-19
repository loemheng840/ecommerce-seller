/**
 * Attribute API Service
 */

import { api } from './client';
import type {
    AttributeResponse,
    AttributeRequest,
    AttributeValueResponse,
    AttributeValueRequest,
} from '@/types/attribute';

export const attributeApi = {
    /**
     * Get all attributes
     */
    getAllAttributes: () =>
        api.get<AttributeResponse[]>('/api/v1/attributes'),

    /**
     * Get single attribute by ID
     */
    getAttribute: (id: string) =>
        api.get<AttributeResponse>(`/api/v1/attributes/${id}`),

    /**
     * Create new attribute
     */
    createAttribute: (data: AttributeRequest) =>
        api.post<AttributeResponse>('/api/v1/attributes', data),

    /**
     * Delete attribute
     */
    deleteAttribute: (id: string) =>
        api.delete<void>(`/api/v1/attributes/${id}`),

    /**
     * Get all values for an attribute
     */
    getAttributeValues: (attributeId: string) =>
        api.get<AttributeValueResponse[]>(
            `/api/v1/attributes/${attributeId}/values`
        ),

    /**
     * Create new attribute value
     */
    createAttributeValue: (attributeId: string, data: AttributeValueRequest) =>
        api.post<AttributeValueResponse>(
            `/api/v1/attributes/${attributeId}/values`,
            data
        ),

    /**
     * Delete attribute value
     */
    deleteAttributeValue: (valueId: string) =>
        api.delete<void>(`/api/v1/attributes/values/${valueId}`),
};
