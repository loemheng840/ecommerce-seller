'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';
import { brandApi } from '@/lib/api/brandApi';
import { getCurrentStoreId } from '@/lib/utils/auth';
import { formatPrice, formatDate, getStatusEmoji } from '@/lib/utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    LayoutGrid,
    LayoutList,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Package,
    AlertCircle
} from 'lucide-react';
import type { ProductResponse, ProductStatus, CategoryResponse, BrandResponse } from '@/types/product';

type ViewMode = 'grid' | 'list';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        keyword: '',
        status: '' as ProductStatus | '',
        categoryId: '',
        brandId: '',
    });

    const [storeId, setStoreId] = useState<string | null>(null);

    // Handle mounting and get storeId on client only
    useEffect(() => {
        setMounted(true);
        setStoreId(getCurrentStoreId());
    }, []);

    // Load categories and brands
    useEffect(() => {
        Promise.all([
            categoryApi.getAllCategories({ active: true }),
            brandApi.getAllBrands({ active: true }),
        ])
            .then(([categoriesData, brandsData]) => {
                setCategories(categoriesData.content);
                setBrands(brandsData.content);
            })
            .catch((err) => {
                console.error('Failed to load categories/brands:', err);
            });
    }, []);

    // Load products
    useEffect(() => {
        if (!storeId) {
            setError('Store ID not found');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        productApi
            .getStoreProducts(storeId, {
                page,
                size: 20,
                status: filters.status || undefined,
                categoryId: filters.categoryId || undefined,
                brandId: filters.brandId || undefined,
                keyword: filters.keyword || undefined,
            })
            .then((data) => {
                setProducts(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            })
            .catch((err) => {
                setError(err.message || 'Failed to load products');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [storeId, page, filters]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productApi.deleteProduct(id);
            // Reload products
            if (!storeId) return;
            setPage(0);
            const data = await productApi.getStoreProducts(storeId, { page: 0, size: 20 });
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err: any) {
            alert('Failed to delete product: ' + err.message);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(0); // Reset to first page
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            status: '',
            categoryId: '',
            brandId: '',
        });
        setPage(0);
    };

    const getStatusBadgeVariant = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'default';
            case 'DRAFT':
                return 'secondary';
            case 'INACTIVE':
                return 'outline';
            case 'OUT_OF_STOCK':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStockStatus = (product: ProductResponse) => {
        if (product.quantity === 0) {
            return { text: 'Out of Stock', className: 'text-destructive' };
        }
        if (product.quantity < product.lowStockThreshold) {
            return { text: 'Low Stock', className: 'text-yellow-600 dark:text-yellow-500' };
        }
        return { text: 'In Stock', className: 'text-success' };
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!storeId) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Store ID not found. Please log in again.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your store products • {totalElements} total
                    </p>
                </div>
                <Button asChild size="default">
                    <Link href="/products/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Filters & View Toggle */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* View Toggle & Filter Button */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? 'bg-muted' : ''}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                            <div className="flex rounded-lg border">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={viewMode === 'grid' ? 'bg-muted' : ''}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-muted' : ''}
                                >
                                    <LayoutList className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                    <option value="DISCONTINUED">Discontinued</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={filters.categoryId}
                                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Brand Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Brand</label>
                                <select
                                    value={filters.brandId}
                                    onChange={(e) => handleFilterChange('brandId', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loading */}
            {loading && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground mt-4">Loading products...</p>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-medium">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Products Grid/List */}
            {!loading && !error && (
                <>
                    {products.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {filters.keyword || filters.status || filters.categoryId || filters.brandId
                                        ? 'Try adjusting your filters'
                                        : 'Get started by creating your first product'}
                                </p>
                                {!filters.keyword && !filters.status && !filters.categoryId && !filters.brandId && (
                                    <Button asChild>
                                        <Link href="/products/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Product
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => {
                                const stockStatus = getStockStatus(product);
                                return (
                                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                                        <CardContent className="p-0">
                                            {/* Image */}
                                            <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-muted">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-12 w-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant={getStatusBadgeVariant(product.status)}>
                                                        {product.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {product.category.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <span className={`text-sm font-medium ${stockStatus.className}`}>
                                                        {product.quantity} units
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        asChild
                                                    >
                                                        <Link href={`/products/${product.id}`}>
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        asChild
                                                    >
                                                        <Link href={`/products/${product.id}/edit`}>
                                                            <Edit2 className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            return (
                                                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            {product.thumbnail ? (
                                                                <img
                                                                    src={product.thumbnail}
                                                                    alt={product.name}
                                                                    className="h-10 w-10 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {product.slug}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{product.category.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium">{formatPrice(product.price)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className={`font-medium ${stockStatus.className}`}>
                                                                {product.quantity}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {stockStatus.text}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant={getStatusBadgeVariant(product.status)}>
                                                            {product.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                        {formatDate(product.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/products/${product.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/products/${product.id}/edit`}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(product.id)}
                                                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {page * 20 + 1} to {Math.min((page + 1) * 20, totalElements)} of{' '}
                                {totalElements} products
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium px-3">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
