'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { brandApi } from '@/lib/api/brandApi';
import {
    Trash2,
    Edit2,
    Loader2,
    AlertCircle,
    Award,
    X,
    Save,
    ChevronLeft,
} from 'lucide-react';
import type { BrandResponse } from '@/types/product';

export default function BrandManagePage() {
    // Brands state
    const [allBrands, setAllBrands] = useState<BrandResponse[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(true);
    const [brandsError, setBrandsError] = useState<string | null>(null);

    // Brand form state
    const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null);
    const [brandFormData, setBrandFormData] = useState({
        name: '',
        slug: '',
        description: '',
        logo: '',
        active: true,
    });
    const [brandSubmitting, setBrandSubmitting] = useState(false);

    // Load brands
    useEffect(() => {
        const loadBrands = async () => {
            try {
                setBrandsLoading(true);
                const data = await brandApi.getAllBrands();
                setAllBrands(data.content);
                setBrandsError(null);
            } catch (err: any) {
                setBrandsError(err.message || 'Failed to load brands');
            } finally {
                setBrandsLoading(false);
            }
        };

        loadBrands();
    }, []);

    // Brand handlers
    const handleEditBrand = (brand: BrandResponse) => {
        setSelectedBrand(brand);
        setBrandFormData({
            name: brand.name,
            slug: brand.slug,
            description: brand.description || '',
            logo: brand.logo || '',
            active: brand.active,
        });
    };

    const handleClearBrand = () => {
        setSelectedBrand(null);
        setBrandFormData({
            name: '',
            slug: '',
            description: '',
            logo: '',
            active: true,
        });
    };

    const handleSaveBrand = async () => {
        setBrandSubmitting(true);
        try {
            if (selectedBrand) {
                await brandApi.updateBrand(selectedBrand.id, brandFormData);
            } else {
                await brandApi.createBrand(brandFormData);
            }

            const data = await brandApi.getAllBrands();
            setAllBrands(data.content);
            handleClearBrand();
        } catch (err: any) {
            alert(err.message || 'Failed to save brand');
        } finally {
            setBrandSubmitting(false);
        }
    };

    const handleDeleteBrand = async (id: string) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;

        try {
            await brandApi.deleteBrand(id);
            setAllBrands(allBrands.filter((b) => b.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete brand');
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">Manage Brands</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage product brands
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Brand Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedBrand ? 'Edit Brand' : 'Create New Brand'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedBrand
                                        ? `Editing: ${selectedBrand.name}`
                                        : 'Fill in the details to add a new brand'}
                                </CardDescription>
                            </div>
                            {selectedBrand && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearBrand}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand-name">Brand Name *</Label>
                            <Input
                                id="brand-name"
                                value={brandFormData.name}
                                onChange={(e) =>
                                    setBrandFormData({
                                        ...brandFormData,
                                        name: e.target.value,
                                        slug: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-'),
                                    })
                                }
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand-slug">Slug *</Label>
                            <Input
                                id="brand-slug"
                                value={brandFormData.slug}
                                onChange={(e) =>
                                    setBrandFormData({
                                        ...brandFormData,
                                        slug: e.target.value,
                                    })
                                }
                                placeholder="brand-slug"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand-desc">Description</Label>
                            <Textarea
                                id="brand-desc"
                                rows={3}
                                value={brandFormData.description}
                                onChange={(e) =>
                                    setBrandFormData({
                                        ...brandFormData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe this brand"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand-logo">Logo URL</Label>
                            <Input
                                id="brand-logo"
                                value={brandFormData.logo}
                                onChange={(e) =>
                                    setBrandFormData({
                                        ...brandFormData,
                                        logo: e.target.value,
                                    })
                                }
                                placeholder="https://example.com/logo.jpg"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="brand-active"
                                checked={brandFormData.active}
                                onChange={(e) =>
                                    setBrandFormData({
                                        ...brandFormData,
                                        active: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor="brand-active" className="text-sm font-medium cursor-pointer">
                                Active (visible to customers)
                            </Label>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={handleSaveBrand}
                                disabled={brandSubmitting}
                                className="flex-1"
                            >
                                {brandSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {selectedBrand ? 'Update Brand' : 'Create Brand'}
                                    </>
                                )}
                            </Button>
                            {selectedBrand && (
                                <Button
                                    onClick={handleClearBrand}
                                    disabled={brandSubmitting}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Brands List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Brands</CardTitle>
                        <CardDescription>
                            {brandsLoading
                                ? 'Loading brands...'
                                : `${allBrands.length} brand(s) found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {brandsError && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                                <AlertCircle className="h-4 w-4" />
                                {brandsError}
                            </div>
                        )}

                        {brandsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : allBrands.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Award className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No brands yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                                {allBrands.map((brand) => (
                                    <div
                                        key={brand.id}
                                        className={`group p-4 rounded-xl border transition-all ${selectedBrand?.id === brand.id
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-muted/30 border-border hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-sm truncate">
                                                        {brand.name}
                                                    </h4>
                                                    <Badge variant={brand.active ? "default" : "secondary"} className="text-xs">
                                                        {brand.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {brand.slug}
                                                </p>
                                                {brand.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                                        {brand.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditBrand(brand)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteBrand(brand.id)}
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
