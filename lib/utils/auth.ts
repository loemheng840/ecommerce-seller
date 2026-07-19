/**
 * Authentication utilities
 */

/**
 * Get current store ID from auth context
 * TODO: Replace with actual implementation based on your auth system
 */
export function getCurrentStoreId(): string {
    // This is a placeholder - replace with actual implementation
    // You might get this from:
    // 1. JWT token claims
    // 2. User context/session
    // 3. Local storage
    // 4. API call to get user profile

    if (typeof window === 'undefined') return '';

    const storeId = localStorage.getItem('store_id');
    return storeId || '';
}

/**
 * Set current store ID
 */
export function setCurrentStoreId(storeId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('store_id', storeId);
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string {
    if (typeof window === 'undefined') return '';

    const userId = localStorage.getItem('user_id');
    return userId || '';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('auth_token');
    return !!token;
}

/**
 * Clear authentication
 */
export function clearAuth() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('store_id');
    localStorage.removeItem('user_id');

    // Clear cookie
    document.cookie = 'access_token=; path=/; max-age=0';
}

/**
 * Logout and redirect to login
 */
export function logout() {
    clearAuth();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}
