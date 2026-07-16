import Keycloak from 'keycloak-js'
import { createAppKeycloakConfig, appConfigs, type AppType } from './keycloak-config'

// Factory function to create Keycloak service for specific app type
export const createKeycloakService = (appType: AppType) => {
    const appConfig = appConfigs[appType]
    const keycloakConfig = createAppKeycloakConfig(appType)

    console.log(`🔧 Creating Keycloak service for ${appConfig.name}:`, keycloakConfig)

    // Create Keycloak instance for this app
    const keycloak = new Keycloak(keycloakConfig)

    return {
        // Initialize Keycloak
        init: async () => {
            try {
                console.log(`🚀 Starting Keycloak initialization for ${appConfig.name}...`)

                // Test realm connectivity
                const testUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}`
                console.log('🔍 Testing connectivity to:', testUrl)

                try {
                    const response = await fetch(testUrl, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache'
                    })

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                    }

                    const realmInfo = await response.json()
                    console.log('✅ Keycloak realm accessible:', realmInfo.realm)
                } catch (fetchError: any) {
                    console.error('❌ Connectivity test failed:', fetchError)
                    throw new Error(`Cannot reach Keycloak: ${fetchError.message}`)
                }

                console.log('🔧 Initializing Keycloak client...')

                const redirectUri = typeof window !== 'undefined'
                    ? window.location.origin
                    : `http://localhost:${appConfig.port}`

                const initOptions = {
                    onLoad: 'check-sso' as const,
                    silentCheckSsoRedirectUri: redirectUri + '/silent-check-sso.html',
                    checkLoginIframe: false,
                    pkceMethod: 'S256' as const,
                    enableLogging: true,
                    messageReceiveTimeout: 10000,
                    responseMode: 'fragment' as const,
                    flow: 'standard' as const
                }

                console.log(`🔧 Using init options for ${appConfig.name}:`, initOptions)
                const authenticated = await keycloak.init(initOptions)

                if (authenticated) {
                    console.log(`✅ User authenticated via Keycloak for ${appConfig.name}`)
                    console.log('👤 User info:', keycloak.tokenParsed)

                    // Check if user has required role for this app
                    if (!keycloak.hasRealmRole(appConfig.requiredRole)) {
                        console.warn(`❌ User doesn't have required role: ${appConfig.requiredRole}`)
                        throw new Error(`Access denied: ${appConfig.requiredRole} role required`)
                    }

                    return true
                } else {
                    console.log(`ℹ️ User not authenticated for ${appConfig.name}`)
                    return false
                }
            } catch (error: any) {
                console.error(`❌ Keycloak initialization failed for ${appConfig.name}:`, error)
                throw error
            }
        },

        // Login
        login: () => {
            const redirectUri = typeof window !== 'undefined'
                ? window.location.origin
                : `http://localhost:${appConfig.port}`

            console.log(`🔑 Redirecting to Keycloak login for ${appConfig.name}...`)
            return keycloak.login({
                redirectUri,
                locale: 'en'
            })
        },

        // Register (if allowed for this app type)
        register: () => {
            if (!appConfig.allowRegistration) {
                console.error(`❌ Registration not allowed for ${appConfig.name}`)
                throw new Error(`Registration not allowed for ${appConfig.name}`)
            }

            const redirectUri = typeof window !== 'undefined'
                ? window.location.origin
                : `http://localhost:${appConfig.port}`

            const registrationUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/registrations?client_id=${keycloakConfig.clientId}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(redirectUri)}`

            console.log(`📝 Redirecting to registration for ${appConfig.name}...`)
            window.location.href = registrationUrl
        },

        // Logout
        logout: () => {
            const redirectUri = typeof window !== 'undefined'
                ? window.location.origin
                : `http://localhost:${appConfig.port}`

            console.log(`👋 Logging out from ${appConfig.name}...`)
            return keycloak.logout({
                redirectUri,
            })
        },

        // Get token
        getToken: () => keycloak.token,

        // Get user info
        getUserInfo: () => {
            if (keycloak.tokenParsed) {
                return {
                    id: keycloak.tokenParsed.sub,
                    username: keycloak.tokenParsed.preferred_username,
                    email: keycloak.tokenParsed.email,
                    firstName: keycloak.tokenParsed.given_name,
                    lastName: keycloak.tokenParsed.family_name,
                    roles: keycloak.tokenParsed.realm_access?.roles || [],
                }
            }
            return null
        },

        // Role checking methods
        hasRole: (role: string) => keycloak.hasRealmRole(role),
        hasRequiredRole: () => keycloak.hasRealmRole(appConfig.requiredRole),
        isAdmin: () => keycloak.hasRealmRole('ADMIN'),
        isSeller: () => keycloak.hasRealmRole('SELLER'),
        isCustomer: () => keycloak.hasRealmRole('CUSTOMER'),
        isAuthenticated: () => keycloak.authenticated || false,

        // Update token
        updateToken: async (minValidity = 30) => {
            try {
                const refreshed = await keycloak.updateToken(minValidity)
                if (refreshed) {
                    console.log('🔄 Token refreshed')
                }
                return keycloak.token
            } catch (error) {
                console.error('❌ Failed to refresh token:', error)
                keycloak.login()
                return null
            }
        },

        // App configuration getters
        getAppConfig: () => appConfig,
        canRegister: () => appConfig.allowRegistration,

        // Get Keycloak instance (for advanced usage)
        getInstance: () => keycloak
    }
}

// Create seller-specific service 
export const sellerKeycloakService = createKeycloakService('seller')

// Export for backward compatibility
export const keycloakService = sellerKeycloakService