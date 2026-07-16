// Shared Keycloak Configuration for All Frontend Apps
export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}

// App-specific configurations
export const appTypes = {
    ADMIN: 'admin',
    SELLER: 'seller',
    CUSTOMER: 'customer'
} as const

export type AppType = typeof appTypes[keyof typeof appTypes]

export const appConfigs = {
    admin: {
        clientId: 'admin-web',
        name: 'Admin Portal',
        requiredRole: 'ADMIN',
        allowRegistration: false,
        port: 3000,
        description: 'Marketplace administration dashboard'
    },
    seller: {
        clientId: 'seller-web',
        name: 'Seller Portal',
        requiredRole: 'SELLER',
        allowRegistration: true,
        port: 3001,
        description: 'Store management and seller tools'
    },
    customer: {
        clientId: 'customer-web',
        name: 'Customer Portal',
        requiredRole: 'CUSTOMER',
        allowRegistration: true,
        port: 3002,
        description: 'Shopping and customer account management'
    }
} as const

// Create keycloak configuration for specific app type
export const createAppKeycloakConfig = (appType: AppType) => {
    const appConfig = appConfigs[appType]
    return {
        ...keycloakConfig,
        clientId: appConfig.clientId
    }
}

console.log('🔧 Keycloak Config Base Loaded:', keycloakConfig)