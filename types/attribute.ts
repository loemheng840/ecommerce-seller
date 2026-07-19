/**
 * Attribute Types
 */

export interface AttributeResponse {
    id: string;
    name: string;
}

export interface AttributeRequest {
    name: string;
}

export interface AttributeValueResponse {
    id: string;
    attributeId: string;
    value: string;
}

export interface AttributeValueRequest {
    attributeId: string;
    value: string;
}

/**
 * Helper type for attributes with their values
 */
export interface AttributeWithValues extends AttributeResponse {
    values: AttributeValueResponse[];
}
