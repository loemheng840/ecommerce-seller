/**
 * Reusable Loading Component
 */

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="text-center py-12">
            <div
                className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
            ></div>
            {message && <p className="text-gray-600 mt-2">{message}</p>}
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div
            className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
        ></div>
    );
}
