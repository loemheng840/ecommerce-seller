"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import type { Brand, Category, Product, ProductRequest, ProductStatus } from "@/types";

const productStatuses: ProductStatus[] = [
    "DRAFT",
    "ACTIVE",
    "INACTIVE",
    "OUT_OF_STOCK",
    "DISCONTINUED",
];

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().optional(),
    price: z
        .string()
        .min(1, "Price is required")
        .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, "Price must be positive"),
    quantity: z.string().optional(),
    storeId: z.string().optional(),
    status: z.enum(productStatuses),
    categoryId: z.string().min(1, "Select a category"),
    brandId: z.string().min(1, "Select a brand"),
});

export type ProductFormData = z.infer<typeof schema>;

type ProductFormProps = {
    product?: Product;
    submitLabel: string;
    submittingLabel: string;
    onSubmit: (payload: ProductRequest) => Promise<void>;
    onCancelHref?: string;
};

function unwrapList<T>(data: T[] | { content?: T[] }) {
    return Array.isArray(data) ? data : data.content ?? [];
}

export function ProductForm({
    product,
    submitLabel,
    submittingLabel,
    onSubmit,
    onCancelHref = "/products",
}: ProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [referenceError, setReferenceError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const defaultValues = useMemo<ProductFormData>(
        () => ({
            name: product?.name ?? "",
            slug: product?.slug ?? "",
            description: product?.description ?? "",
            price: product ? String(product.price) : "",
            quantity: product ? String(product.quantity) : "0",
            storeId: product?.storeId ?? "",
            status: product?.status ?? "DRAFT",
            categoryId: product?.category?.id ?? "",
            brandId: product?.brand?.id ?? "",
        }),
        [product]
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const [previewName, previewDescription, previewPrice, previewStatus, previewCategoryId, previewBrandId] = useWatch({
        control,
        name: ["name", "description", "price", "status", "categoryId", "brandId"],
    });
    const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(defaultValues.status);
    const [selectedCategoryId, setSelectedCategoryId] = useState(defaultValues.categoryId);
    const [selectedBrandId, setSelectedBrandId] = useState(defaultValues.brandId);

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        let cancelled = false;

        async function fetchReferences() {
            setReferenceError(null);
            try {
                const [categoryRes, brandRes] = await Promise.all([
                    api.get<Category[] | { content?: Category[] }>("/api/v1/categories"),
                    api.get<Brand[] | { content?: Brand[] }>("/api/v1/brands"),
                ]);

                if (!cancelled) {
                    setCategories(unwrapList(categoryRes.data));
                    setBrands(unwrapList(brandRes.data));
                }
            } catch {
                if (!cancelled) {
                    setReferenceError("Failed to load categories or brands.");
                }
            }
        }

        fetchReferences();
        return () => {
            cancelled = true;
        };
    }, []);

    const submit = async (data: ProductFormData) => {
        setSubmitError(null);
        try {
            await onSubmit({
                name: data.name,
                slug: data.slug,
                description: data.description,
                price: Number(data.price),
                quantity: Number(data.quantity || "0"),
                storeId: data.storeId || "",
                status: data.status,
                categoryId: data.categoryId,
                brandId: data.brandId,
            });
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setSubmitError(message ?? "Failed to save product.");
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Card className="h-fit xl:sticky xl:top-6">
                <CardHeader>
                    <CardTitle className="text-base">Product Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">Preview</span>
                            <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium">
                                {previewStatus?.replaceAll("_", " ") ?? "DRAFT"}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">
                                {previewName || "Your product name"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {previewDescription || "Add a product description to preview the listing here."}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span>Price</span>
                                <span className="font-semibold">
                                    {previewPrice ? `$${Number(previewPrice).toFixed(2)}` : "$0.00"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Category</span>
                                <span className="font-medium">
                                    {categories.find((category) => category.id === previewCategoryId)?.name ?? "Select category"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Brand</span>
                                <span className="font-medium">
                                    {brands.find((brand) => brand.id === previewBrandId)?.name ?? "Select brand"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit(submit)} className="space-y-5">
                {(referenceError || submitError) && (
                    <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {submitError ?? referenceError}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Wireless Bluetooth Headphones"
                                {...register("name", {
                                    onChange: (event) => {
                                        if (!product) setValue("slug", slugify(event.target.value));
                                    },
                                })}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input id="slug" placeholder="wireless-bluetooth-headphones" {...register("slug")} />
                            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your product..."
                                rows={4}
                                {...register("description")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pricing & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="price">Base Price (USD) *</Label>
                                <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
                                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Status *</Label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(value) => {
                                        const nextStatus = value as ProductStatus;
                                        setSelectedStatus(nextStatus);
                                        setValue("status", nextStatus);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.replaceAll("_", " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Category & Brand</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Category *</Label>
                                <Select
                                    value={selectedCategoryId}
                                    onValueChange={(value) => {
                                        setSelectedCategoryId(value);
                                        setValue("categoryId", value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Brand *</Label>
                                <Select
                                    value={selectedBrandId}
                                    onValueChange={(value) => {
                                        setSelectedBrandId(value);
                                        setValue("brandId", value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" asChild>
                        <Link href={onCancelHref}>Cancel</Link>
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
