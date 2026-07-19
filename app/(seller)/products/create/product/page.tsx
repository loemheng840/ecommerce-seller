'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCurrentStoreId } from '@/lib/utils/auth';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';
import { brandApi } from '@/lib/api/brandApi';
import {
    Trash2,
    Edit2,
    Loader2,
    AlertCircle,
    Package,
    X,
    Save,
    ChevronLeft,
} from 'lucide-react';
import type { ProductResponse, ProductStatus, CategoryResponse, BrandResponse } from '@/types/product';

export default function ProductManagePage() {
    const storeId = getCurrentStoreId();

    // Products state
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);

    // Product form state
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [productFormData, setProductFormData] = useState({
        name: '',
        slug: '',
        description: '',
        thumbnail: '',
        status: 'DRAFT' as ProductStatus,
        categoryId: '',
        brandId: '',
        quantity: 0,
        price: 0,
    });
    const [productSubmitting, setProductSubmitting] = useState(false);

    // Categories and Brands for dropdowns
    const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
    const [allBrands, setAllBrands] = useState<BrandResponse[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [brandsLoading, setBrandsLoading] = useState(true);

    // Load products
    useEffect(() => {
        if (!storeId) {
            setProductsError('Store ID not found');
            setProductsLoading(false);
            return;
        }

        const loadProducts = async () => {
            try {
                setProductsLoading(true);
                const data = await productApi.getStoreProducts(storeId, { page: 0, size: 100 });
                setProducts(data.content);
                setProductsError(null);
            } catch (err: any) {
                setProductsError(err.message || 'Failed to load products');
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, [storeId]);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await categoryApi.getAllCategories();
                setAllCategories(data.content);
            } catch (err: any) {
                console.error('Failed to load categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Load brands
    useEffect(() => {
        const loadBrands = async () => {
            try {
                setBrandsLoading(true);
                const data = await brandApi.getAllBrands();
                setAllBrands(data.content);
            } catch (err: any) {
                console.error('Failed to load brands:', err);
            } finally {
                setBrandsLoading(false);
            }
        };

        loadBrands();
    }, []);

    // Product handlers
    const handleEditProduct = (product: ProductResponse) => {
        setSelectedProduct(product);
        setProductFormData({
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            thumbnail: product.thumbnail || '',
            status: product.status,
            categoryId: product.category.id,
            brandId: product.brand?.id || '',
            quantity: product.quantity,
            price: product.price,
        });
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
        setProductFormData({
            name: '',
            slug: '',
            description: '',
            thumbnail: '',
            status: 'DRAFT',
            categoryId: '',
            brandId: '',
            quantity: 0,
            price: 0,
        });
    };

    const handleSaveProduct = async () => {
        if (!storeId) return;

        setProductSubmitting(true);
        try {
            if (selectedProduct) {
                await productApi.updateProduct(selectedProduct.id, {
                    ...productFormData,
                    storeId,
                });
            } else {
                await productApi.createProduct({
                    ...productFormData,
                    storeId,
                });
            }

            const data = await productApi.getStoreProducts(storeId, { page: 0, size: 100 });
            setProducts(data.content);
            handleClearProduct();
        } catch (err: any) {
            alert(err.message || 'Failed to save product');
        } finally {
            setProductSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productApi.deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete product');
        }
    };

    if (!storeId) {
        return (
            <div className="space-y-6">
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-medium">Store ID not found. Please log in again.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/products/create">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your store products
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Product Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedProduct ? 'Edit Product' : 'Create New Product'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedProduct
                                        ? `Editing: ${selectedProduct.name}`
                                        : 'Fill in the details to add a new product'}
                                </CardDescription>
                            </div>
                            {selectedProduct && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearProduct}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="prod-name">Product Name *</Label>
                                <Input
                                    id="prod-name"
                                    value={productFormData.name}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            name: e.target.value,
                                            slug: e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, '-'),
                                        })
                                    }
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="prod-slug">Slug *</Label>
                                <Input
                                    id="prod-slug"
                                    value={productFormData.slug}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            slug: e.target.value,
                                        })
                                    }
                                    placeholder="product-slug"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="prod-desc">Description</Label>
                                <Textarea
                                    id="prod-desc"
                                    rows={3}
                                    value={productFormData.description}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Describe your product"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="prod-thumb">Thumbnail URL</Label>
                                <Input
                                    id="prod-thumb"
                                    value={productFormData.thumbnail}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            thumbnail: e.target.value,
                                        })
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prod-price">Price ($) *</Label>
                                <Input
                                    id="prod-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={productFormData.price}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            price: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prod-qty">Quantity *</Label>
                                <Input
                                    id="prod-qty"
                                    type="number"
                                    min="0"
                                    value={productFormData.quantity}
                                    onChange={(e) =>
                                        setProductFormData({
                                            ...productFormData,
                                            quantity: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prod-status">Status *</Label>
                                <Select
                                    value={productFormData.status}
                                    onValueChange={(v) =>
                                        setProductFormData({
                                            ...productFormData,
                                            status: v as ProductStatus,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prod-cat">Category *</Label>
                                <Select
                                    value={productFormData.categoryId}
                                    onValueChange={(v) =>
                                        setProductFormData({
                                            ...productFormData,
                                            categoryId: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="prod-brand">Brand (optional)</Label>
                                <Select
                                    value={productFormData.brandId}
                                    onValueChange={(v) =>
                                        setProductFormData({
                                            ...productFormData,
                                            brandId: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No Brand</SelectItem>
                                        {allBrands.filter(b => b.active).map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={handleSaveProduct}
                                disabled={productSubmitting}
                                className="flex-1"
                            >
                                {productSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {selectedProduct ? 'Update Product' : 'Create Product'}
                                    </>
                                )}
                            </Button>
                            {selectedProduct && (
                                <Button
                                    onClick={handleClearProduct}
                                    disabled={productSubmitting}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Products List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                        <CardDescription>
                            {productsLoading
                                ? 'Loading products...'
                                : `${products.length} product(s) found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {productsError && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                                <AlertCircle className="h-4 w-4" />
                                {productsError}
                            </div>
                        )}

                        {productsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No products yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`group p-4 rounded-xl border transition-all ${selectedProduct?.id === product.id
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-muted/30 border-border hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div>
                                                    <h4 className="font-semibold text-sm truncate">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {product.slug}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <Badge variant="outline" className="font-mono">
                                                        ${product.price.toFixed(2)}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            product.status === 'ACTIVE'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                    <span className="text-muted-foreground">
                                                        Stock: {product.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditProduct(product)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        handleDeleteProduct(product.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
