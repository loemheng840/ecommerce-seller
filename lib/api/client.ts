/**
 * Base API Client for Seller Dashboard
 * Handles error handling and common request patterns
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: any
    ) {
        super(`API Error ${status}: ${statusText}`);
        this.name = 'ApiError';
    }
}

/**
 * Base API request function
 */
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const config: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        // Parse response body
        const data = await response.json().catch(() => ({}));

        // Handle errors
        if (!response.ok) {
            throw new ApiError(response.status, response.statusText, data);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
        throw new ApiError(0, 'Network Error', {
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Convenient API methods
 */
export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Pagination helper types
 */
export interface Page<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}
