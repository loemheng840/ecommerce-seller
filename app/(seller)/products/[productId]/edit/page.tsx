"use client";

import { use, useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Product, ProductRequest } from "@/types";
import { ProductForm } from "../../_components/product-form";

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = use(params);
    const router = useRouter();
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

    const updateProduct = async (payload: ProductRequest) => {
        await api.put(`/api/v1/products/${productId}`, payload);
        router.push("/products");
        router.refresh();
    };

    return (
        <Shell title="Edit Product">
            <div className="max-w-2xl space-y-5">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/products">
                        <ArrowLeft className="size-4" /> Back to Products
                    </Link>
                </Button>

                {loading ? (
                    <div className="space-y-4">
                        <div className="h-40 animate-pulse rounded-xl bg-muted" />
                        <div className="h-40 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : error || !product ? (
                    <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error ?? "Product not found."}
                    </div>
                ) : (
                    <ProductForm
                        product={product}
                        submitLabel="Save Changes"
                        submittingLabel="Saving Changes"
                        onSubmit={updateProduct}
                    />
                )}
            </div>
        </Shell>
    );
}
