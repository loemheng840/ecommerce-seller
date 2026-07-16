import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
    Store,
    StoreCreateRequest,
    StoreUpdateRequest,
    StoreStatusHistory,
    Page
} from '@/types'

// Define response types based on the backend DTOs
export interface StoreResponse {
    id: string
    name: string
    description: string
    slug: string
    logo?: string
    contactInfo?: string
    storeOwnerId?: string
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CLOSED'
    createdAt: string
    updatedAt: string
    createdBy?: string
    updatedBy?: string
}

export interface StoreListResponse {
    id: string
    name: string
    slug: string
    logo?: string
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CLOSED'
}

export interface StoreStatusHistoryResponse {
    id: string
    storeId: string
    oldStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CLOSED'
    newStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CLOSED'
    changedBy: string
    changedAt: string
    reason?: string
}

// Query parameters interfaces
export interface StoreSearchParams {
    q: string
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
}

export interface StoreListParams {
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
}

export interface StoresByStatusParams {
    status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CLOSED'
    page?: number
    size?: number
}

export interface StoresByDateRangeParams {
    startDate: string // ISO date format
    endDate: string   // ISO date format
    page?: number
    size?: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const storeApi = createApi({
    reducerPath: 'storeApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/api/v1`,
        prepareHeaders: (headers) => {
            // Get auth token from localStorage if available
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access_token')
                if (token) {
                    headers.set('authorization', `Bearer ${token}`)
                }
            }
            headers.set('content-type', 'application/json')
            return headers
        },
    }),
    tagTypes: ['Store', 'StoreList', 'StoreHistory'],
    endpoints: (builder) => ({
        // GET /api/v1/stores - Get all active stores (paginated)
        getAllStores: builder.query<Page<StoreListResponse>, StoreListParams | void>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams()
                if (params.page !== undefined) searchParams.append('page', params.page.toString())
                if (params.size !== undefined) searchParams.append('size', params.size.toString())
                if (params.sortBy) searchParams.append('sortBy', params.sortBy)
                if (params.sortDirection) searchParams.append('sortDirection', params.sortDirection)

                return {
                    url: '/stores',
                    params: searchParams,
                }
            },
            providesTags: ['StoreList'],
        }),

        // GET /api/v1/stores/{id} - Get store by ID
        getStoreById: builder.query<StoreResponse, string>({
            query: (id) => `/stores/${id}`,
            providesTags: (result, error, id) => [{ type: 'Store', id }],
        }),

        // GET /api/v1/stores/slug/{slug} - Get store by slug
        getStoreBySlug: builder.query<StoreResponse, string>({
            query: (slug) => `/stores/slug/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Store', id: slug }],
        }),

        // GET /api/v1/stores/status/{status} - Get stores by status (Admin only)
        getStoresByStatus: builder.query<Page<StoreListResponse>, StoresByStatusParams>({
            query: ({ status, page = 0, size = 20 }) => {
                const searchParams = new URLSearchParams()
                searchParams.append('page', page.toString())
                searchParams.append('size', size.toString())

                return {
                    url: `/stores/status/${status}`,
                    params: searchParams,
                }
            },
            providesTags: (result, error, { status }) => [
                { type: 'StoreList', id: `status-${status}` }
            ],
        }),

        // GET /api/v1/stores/search - Search stores
        searchStores: builder.query<Page<StoreListResponse>, StoreSearchParams>({
            query: ({ q, page = 0, size = 20, sortBy = 'name', sortDirection = 'asc' }) => {
                const searchParams = new URLSearchParams()
                searchParams.append('q', q)
                searchParams.append('page', page.toString())
                searchParams.append('size', size.toString())
                searchParams.append('sortBy', sortBy)
                searchParams.append('sortDirection', sortDirection)

                return {
                    url: '/stores/search',
                    params: searchParams,
                }
            },
            providesTags: (result, error, { q }) => [
                { type: 'StoreList', id: `search-${q}` }
            ],
        }),

        // GET /api/v1/stores/filter - Filter stores by date range
        getStoresByDateRange: builder.query<Page<StoreListResponse>, StoresByDateRangeParams>({
            query: ({ startDate, endDate, page = 0, size = 20 }) => {
                const searchParams = new URLSearchParams()
                searchParams.append('startDate', startDate)
                searchParams.append('endDate', endDate)
                searchParams.append('page', page.toString())
                searchParams.append('size', size.toString())

                return {
                    url: '/stores/filter',
                    params: searchParams,
                }
            },
            providesTags: ['StoreList'],
        }),

        // GET /api/v1/stores/{id}/audit-history - Get store audit history (Admin only)
        getStoreAuditHistory: builder.query<StoreStatusHistoryResponse[], string>({
            query: (id) => `/stores/${id}/audit-history`,
            providesTags: (result, error, id) => [{ type: 'StoreHistory', id }],
        }),

        // POST /api/v1/stores - Create store
        createStore: builder.mutation<StoreResponse, StoreCreateRequest>({
            query: (newStore) => ({
                url: '/stores',
                method: 'POST',
                body: newStore,
            }),
            invalidatesTags: ['StoreList'],
        }),

        // PUT /api/v1/stores/{id} - Update store
        updateStore: builder.mutation<StoreResponse, { id: string; data: StoreUpdateRequest }>({
            query: ({ id, data }) => ({
                url: `/stores/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Store', id },
                'StoreList',
            ],
        }),

        // DELETE /api/v1/stores/{id} - Delete store
        deleteStore: builder.mutation<void, string>({
            query: (id) => ({
                url: `/stores/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Store', id },
                'StoreList',
            ],
        }),

        // Store approval workflow endpoints (Admin only)

        // POST /api/v1/stores/{id}/approve - Approve store
        approveStore: builder.mutation<StoreResponse, { id: string; reason?: string }>({
            query: ({ id, reason }) => {
                const searchParams = new URLSearchParams()
                if (reason) searchParams.append('reason', reason)

                return {
                    url: `/stores/${id}/approve`,
                    method: 'POST',
                    params: searchParams,
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Store', id },
                'StoreList',
                { type: 'StoreHistory', id },
            ],
        }),

        // POST /api/v1/stores/{id}/reject - Reject store
        rejectStore: builder.mutation<StoreResponse, { id: string; reason?: string }>({
            query: ({ id, reason }) => {
                const searchParams = new URLSearchParams()
                if (reason) searchParams.append('reason', reason)

                return {
                    url: `/stores/${id}/reject`,
                    method: 'POST',
                    params: searchParams,
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Store', id },
                'StoreList',
                { type: 'StoreHistory', id },
            ],
        }),

        // POST /api/v1/stores/{id}/suspend - Suspend store
        suspendStore: builder.mutation<StoreResponse, { id: string; reason?: string }>({
            query: ({ id, reason }) => {
                const searchParams = new URLSearchParams()
                if (reason) searchParams.append('reason', reason)

                return {
                    url: `/stores/${id}/suspend`,
                    method: 'POST',
                    params: searchParams,
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Store', id },
                'StoreList',
                { type: 'StoreHistory', id },
            ],
        }),

        // POST /api/v1/stores/{id}/reactivate - Reactivate store
        reactivateStore: builder.mutation<StoreResponse, { id: string; reason?: string }>({
            query: ({ id, reason }) => {
                const searchParams = new URLSearchParams()
                if (reason) searchParams.append('reason', reason)

                return {
                    url: `/stores/${id}/reactivate`,
                    method: 'POST',
                    params: searchParams,
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Store', id },
                'StoreList',
                { type: 'StoreHistory', id },
            ],
        }),
    }),
})

// Export hooks for usage in functional components
export const {
    // Query hooks
    useGetAllStoresQuery,
    useGetStoreByIdQuery,
    useGetStoreBySlugQuery,
    useGetStoresByStatusQuery,
    useSearchStoresQuery,
    useGetStoresByDateRangeQuery,
    useGetStoreAuditHistoryQuery,

    // Mutation hooks
    useCreateStoreMutation,
    useUpdateStoreMutation,
    useDeleteStoreMutation,

    // Admin mutation hooks
    useApproveStoreMutation,
    useRejectStoreMutation,
    useSuspendStoreMutation,
    useReactivateStoreMutation,

    // Lazy query hooks for manual triggering
    useLazyGetAllStoresQuery,
    useLazyGetStoreByIdQuery,
    useLazyGetStoreBySlugQuery,
    useLazySearchStoresQuery,
} = storeApi