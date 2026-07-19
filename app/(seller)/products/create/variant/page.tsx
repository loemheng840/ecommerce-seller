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
import { variantApi } from '@/lib/api/variantApi';
import {
    Trash2,
    Edit2,
    Loader2,
    AlertCircle,
    Package,
    Layers,
    X,
    Save,
    ChevronLeft,
} from 'lucide-react';
import type { ProductResponse } from '@/types/product';
import type { ProductVariantResponse } from '@/types/variant';

export default function VariantManagePage() {
    const storeId = getCurrentStoreId();

    // Products state (for dropdown)
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Variants state
    const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
    const [variantsLoading, setVariantsLoading] = useState(true);
    const [variantsError, setVariantsError] = useState<string | null>(null);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<string>('');

    // Variant form state
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
    const [variantFormData, setVariantFormData] = useState({
        sku: '',
        price: 0,
        quantity: 0,
        attributeValueIds: [] as string[],
    });
    const [variantSubmitting, setVariantSubmitting] = useState(false);

    // Load products
    useEffect(() => {
        if (!storeId) {
            setProductsLoading(false);
            return;
        }

        const loadProducts = async () => {
            try {
                setProductsLoading(true);
                const data = await productApi.getStoreProducts(storeId, { page: 0, size: 100 });
                setProducts(data.content);
            } catch (err: any) {
                console.error('Failed to load products:', err);
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, [storeId]);

    // Load variants when a product is selected
    useEffect(() => {
        if (!selectedProductForVariant) {
            setVariants([]);
            return;
        }

        const loadVariants = async () => {
            try {
                setVariantsLoading(true);
                const data = await variantApi.getProductVariants(selectedProductForVariant);
                setVariants(data);
                setVariantsError(null);
            } catch (err: any) {
                setVariantsError(err.message || 'Failed to load variants');
            } finally {
                setVariantsLoading(false);
            }
        };

        loadVariants();
    }, [selectedProductForVariant]);

    // Variant handlers
    const handleEditVariant = (variant: ProductVariantResponse) => {
        setSelectedVariant(variant);
        setVariantFormData({
            sku: variant.sku,
            price: variant.price,
            quantity: variant.quantity,
            attributeValueIds: variant.attributeValueIds,
        });
    };

    const handleClearVariant = () => {
        setSelectedVariant(null);
        setVariantFormData({
            sku: '',
            price: 0,
            quantity: 0,
            attributeValueIds: [],
        });
    };

    const handleSaveVariant = async () => {
        if (!selectedProductForVariant) {
            alert('Please select a product first');
            return;
        }

        setVariantSubmitting(true);
        try {
            if (selectedVariant) {
                await variantApi.updateVariant(selectedVariant.id, variantFormData);
            } else {
                await variantApi.createVariant(selectedProductForVariant, variantFormData);
            }

            const data = await variantApi.getProductVariants(selectedProductForVariant);
            setVariants(data);
            handleClearVariant();
        } catch (err: any) {
            alert(err.message || 'Failed to save variant');
        } finally {
            setVariantSubmitting(false);
        }
    };

    const handleDeleteVariant = async (id: string) => {
        if (!confirm('Are you sure you want to delete this variant?')) return;

        try {
            await variantApi.deleteVariant(id);
            setVariants(variants.filter((v) => v.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete variant');
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
                    <h1 className="text-3xl font-bold tracking-tight">Manage Variants</h1>
                    <p className="text-muted-foreground mt-1">
                        Create product variants with different attributes
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Variant Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedVariant ? 'Edit Variant' : 'Create New Variant'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedVariant
                                        ? `Editing: ${selectedVariant.sku}`
                                        : 'Select a product and create variants with attributes'}
                                </CardDescription>
                            </div>
                            {selectedVariant && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearVariant}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Product Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="var-product">Select Product *</Label>
                            <Select
                                value={selectedProductForVariant}
                                onValueChange={setSelectedProductForVariant}
                                disabled={!!selectedVariant}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((prod) => (
                                        <SelectItem key={prod.id} value={prod.id}>
                                            {prod.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedProductForVariant && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="var-sku">SKU *</Label>
                                    <Input
                                        id="var-sku"
                                        value={variantFormData.sku}
                                        onChange={(e) =>
                                            setVariantFormData({
                                                ...variantFormData,
                                                sku: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., PROD-RED-L"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="var-price">Price ($) *</Label>
                                        <Input
                                            id="var-price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={variantFormData.price}
                                            onChange={(e) =>
                                                setVariantFormData({
                                                    ...variantFormData,
                                                    price: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="var-qty">Quantity *</Label>
                                        <Input
                                            id="var-qty"
                                            type="number"
                                            min="0"
                                            value={variantFormData.quantity}
                                            onChange={(e) =>
                                                setVariantFormData({
                                                    ...variantFormData,
                                                    quantity: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Attribute Values (Select multiple)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Select attribute values that define this variant (e.g., Red + Large)
                                    </p>
                                    {/* Note: This needs a multi-select component. For now, using a textarea */}
                                    <Textarea
                                        value={variantFormData.attributeValueIds.join(', ')}
                                        onChange={(e) =>
                                            setVariantFormData({
                                                ...variantFormData,
                                                attributeValueIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                            })
                                        }
                                        placeholder="Enter attribute value IDs separated by commas"
                                        rows={2}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tip: Go to Attributes page to get value IDs
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        onClick={handleSaveVariant}
                                        disabled={variantSubmitting}
                                        className="flex-1"
                                    >
                                        {variantSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {selectedVariant ? 'Update Variant' : 'Create Variant'}
                                            </>
                                        )}
                                    </Button>
                                    {selectedVariant && (
                                        <Button
                                            onClick={handleClearVariant}
                                            disabled={variantSubmitting}
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}

                        {!selectedProductForVariant && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Layers className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Select a product above to create variants
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Variants List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                        <CardDescription>
                            {!selectedProductForVariant
                                ? 'Select a product to view variants'
                                : variantsLoading
                                    ? 'Loading variants...'
                                    : `${variants.length} variant(s) found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {variantsError && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                                <AlertCircle className="h-4 w-4" />
                                {variantsError}
                            </div>
                        )}

                        {!selectedProductForVariant ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Select a product to view its variants
                                </p>
                            </div>
                        ) : variantsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : variants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Layers className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No variants yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                                {variants.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className={`group p-4 rounded-xl border transition-all ${selectedVariant?.id === variant.id
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-muted/30 border-border hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div>
                                                    <h4 className="font-semibold text-sm truncate">
                                                        {variant.sku}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        ID: {variant.id}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <Badge variant="outline" className="font-mono">
                                                        ${variant.price.toFixed(2)}
                                                    </Badge>
                                                    <span className="text-muted-foreground">
                                                        Stock: {variant.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditVariant(variant)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteVariant(variant.id)}
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
