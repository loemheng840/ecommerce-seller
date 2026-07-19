'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    FolderTree,
    Award,
    Tags,
    Layers,
    ChevronLeft,
    ArrowRight,
} from 'lucide-react';

export default function CreateHubPage() {
    const managementOptions = [
        {
            title: 'Products',
            description: 'Create and manage your store products with pricing and inventory',
            icon: Package,
            href: '/products/create/product',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Categories',
            description: 'Organize products into categories for better navigation',
            icon: FolderTree,
            href: '/products/create/category',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Brands',
            description: 'Add and manage product brands for your store',
            icon: Award,
            href: '/products/create/brand',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Attributes',
            description: 'Define product attributes like color, size, and material with values',
            icon: Tags,
            href: '/products/create/attribute',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Variants',
            description: 'Create product variants with different attribute combinations',
            icon: Layers,
            href: '/products/create/variant',
            color: 'text-pink-500',
            bgColor: 'bg-pink-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/products">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Choose what you want to create or manage
                    </p>
                </div>
            </div>

            {/* Management Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <Link key={option.href} href={option.href}>
                            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 group cursor-pointer">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-2xl ${option.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className={`h-6 w-6 ${option.color}`} />
                                    </div>
                                    <CardTitle className="flex items-center justify-between">
                                        {option.title}
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {option.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Guide Section */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Setup Guide</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                1
                            </div>
                            <div>
                                <p className="font-medium">Create Categories</p>
                                <p className="text-muted-foreground text-xs">Organize your products into logical groups</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                2
                            </div>
                            <div>
                                <p className="font-medium">Add Brands (Optional)</p>
                                <p className="text-muted-foreground text-xs">Define brands if your products have manufacturers</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                3
                            </div>
                            <div>
                                <p className="font-medium">Create Attributes & Values</p>
                                <p className="text-muted-foreground text-xs">Set up product attributes like Color, Size with their values</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                4
                            </div>
                            <div>
                                <p className="font-medium">Add Products</p>
                                <p className="text-muted-foreground text-xs">Create your products with pricing and inventory</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                5
                            </div>
                            <div>
                                <p className="font-medium">Create Variants (Optional)</p>
                                <p className="text-muted-foreground text-xs">Add variants if products have different combinations of attributes</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
