'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoryApi } from '@/lib/api/categoryApi';
import { Trash2, Edit2, Loader2, AlertCircle, FolderTree, X, Save, ChevronLeft } from 'lucide-react';
import type { CategoryResponse } from '@/types/product';

export default function CreateCategoryPage() {
    // Categories state
    const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // Category form state
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        slug: '',
        description: '',
        thumbnail: '',
    });
    const [categorySubmitting, setCategorySubmitting] = useState(false);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await categoryApi.getAllCategories();
                setAllCategories(data.content);
                setCategoriesError(null);
            } catch (err: any) {
                setCategoriesError(err.message || 'Failed to load categories');
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Category handlers
    const handleEditCategory = (category: CategoryResponse) => {
        setSelectedCategory(category);
        setCategoryFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            thumbnail: category.thumbnail || '',
        });
    };

    const handleClearCategory = () => {
        setSelectedCategory(null);
        setCategoryFormData({
            name: '',
            slug: '',
            description: '',
            thumbnail: '',
        });
    };

    const handleSaveCategory = async () => {
        setCategorySubmitting(true);
        try {
            if (selectedCategory) {
                await categoryApi.updateCategory(selectedCategory.id, categoryFormData);
            } else {
                await categoryApi.createCategory(categoryFormData);
            }

            const data = await categoryApi.getAllCategories();
            setAllCategories(data.content);
            handleClearCategory();
        } catch (err: any) {
            alert(err.message || 'Failed to save category');
        } finally {
            setCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryApi.deleteCategory(id);
            setAllCategories(allCategories.filter((c) => c.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete category');
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
                    <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and organize product categories
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Category Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedCategory ? 'Edit Category' : 'Create New Category'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedCategory
                                        ? `Editing: ${selectedCategory.name}`
                                        : 'Fill in the details to add a new category'}
                                </CardDescription>
                            </div>
                            {selectedCategory && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearCategory}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Category Name *</Label>
                            <Input
                                id="cat-name"
                                value={categoryFormData.name}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        name: e.target.value,
                                        slug: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-'),
                                    })
                                }
                                placeholder="Enter category name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-slug">Slug *</Label>
                            <Input
                                id="cat-slug"
                                value={categoryFormData.slug}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        slug: e.target.value,
                                    })
                                }
                                placeholder="category-slug"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Textarea
                                id="cat-desc"
                                rows={3}
                                value={categoryFormData.description}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe this category"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-thumb">Thumbnail URL</Label>
                            <Input
                                id="cat-thumb"
                                value={categoryFormData.thumbnail}
                                onChange={(e) =>
                                    setCategoryFormData({
                                        ...categoryFormData,
                                        thumbnail: e.target.value,
                                    })
                                }
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={handleSaveCategory}
                                disabled={categorySubmitting}
                                className="flex-1"
                            >
                                {categorySubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {selectedCategory ? 'Update Category' : 'Create Category'}
                                    </>
                                )}
                            </Button>
                            {selectedCategory && (
                                <Button
                                    onClick={handleClearCategory}
                                    disabled={categorySubmitting}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                        <CardDescription>
                            {categoriesLoading
                                ? 'Loading categories...'
                                : `${allCategories.length} category(ies) found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoriesError && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                                <AlertCircle className="h-4 w-4" />
                                {categoriesError}
                            </div>
                        )}

                        {categoriesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : allCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FolderTree className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No categories yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                                {allCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`group p-4 rounded-xl border transition-all ${selectedCategory?.id === category.id
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-muted/30 border-border hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {category.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground truncate mt-1">
                                                    {category.slug}
                                                </p>
                                                {category.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                                        {category.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditCategory(category)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        handleDeleteCategory(category.id)
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
