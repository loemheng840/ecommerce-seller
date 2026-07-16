"use client";

import { use, useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, ProductStatus } from "@/types";

const STATUS_VARIANTS: Record<ProductStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    ACTIVE: "success",
    DRAFT: "secondary",
    INACTIVE: "warning",
    OUT_OF_STOCK: "destructive",
    DISCONTINUED: "destructive",
};

export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchProduct() {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get<Product>(`/api/v1/products/${productId}`);
                if (!cancelled) setProduct(res.data);
            } catch {
                if (!cancelled) setError("Failed to load product.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProduct();
        return () => {
            cancelled = true;
        };
    }, [productId]);

    return (
        <Shell title="Product Detail">
            <div className="max-w-4xl space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/products">
                            <ArrowLeft className="size-4" /> Back to Products
                        </Link>
                    </Button>

                    {product && (
                        <Button asChild>
                            <Link href={`/products/${product.id}/edit`}>
                                <Pencil className="size-4" /> Edit Product
                            </Link>
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <div className="h-64 animate-pulse rounded-xl bg-muted" />
                        <div className="h-40 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : error || !product ? (
                    <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error ?? "Product not found."}
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                        <Card>
                            <CardContent className="p-4">
                                <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                                    {product.imageUrls?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                            No image
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-5">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>{product.name}</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">{product.slug}</p>
                                    </div>
                                    <Badge variant={STATUS_VARIANTS[product.status]}>{product.status}</Badge>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Price</p>
                                            <p className="font-semibold">{formatCurrency(product.basePrice)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Category</p>
                                            <p className="font-semibold">{product.category?.name ?? "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Brand</p>
                                            <p className="font-semibold">{product.brand?.name ?? "-"}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">Description</p>
                                        <p className="mt-1 text-sm leading-6">
                                            {product.description || "No description provided."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Management Info</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="font-medium">{formatDate(product.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Last Updated</p>
                                        <p className="font-medium">{formatDate(product.updatedAt)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </Shell>
    );
}
