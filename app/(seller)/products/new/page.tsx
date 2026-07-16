"use client";

import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { ProductRequest } from "@/types";
import { ProductForm } from "../_components/product-form";

export default function NewProductPage() {
    const router = useRouter();

    const createProduct = async (payload: ProductRequest) => {
        await api.post("/api/v1/products", payload);
        router.push("/products");
        router.refresh();
    };

    return (
        <Shell title="Add Product">
            <div className="w-full space-y-5">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/products">
                        <ArrowLeft className="size-4" /> Back to Products
                    </Link>
                </Button>

                <ProductForm
                    submitLabel="Create Product"
                    submittingLabel="Creating Product"
                    onSubmit={createProduct}
                />
            </div>
        </Shell>
    );
}
