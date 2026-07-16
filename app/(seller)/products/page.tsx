"use client";
import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, ProductStatus, Page } from "@/types";

const STATUS_VARIANTS: Record<ProductStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    ACTIVE: "success",
    DRAFT: "secondary",
    INACTIVE: "warning",
    OUT_OF_STOCK: "destructive",
    DISCONTINUED: "destructive",
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, size: 20 };
            if (keyword) params.keyword = keyword;
            if (status !== "all") params.status = status;
            const res = await api.get<Page<Product>>("/api/v1/products", { params });
            setProducts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [keyword, status, page]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        await api.delete(`/api/v1/products/${id}`);
        fetchProducts();
    };

    return (
        <Shell title="Products">
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products…"
                                className="pl-9"
                                value={keyword}
                                onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                            />
                        </div>
                        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button asChild>
                        <Link href="/products/new">
                            <Plus className="size-4" /> Add Product
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Category</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Created</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i}>
                                                {Array.from({ length: 6 }).map((__, j) => (
                                                    <td key={j} className="px-4 py-3">
                                                        <div className="h-4 bg-muted animate-pulse rounded" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                No products found. <Link href="/products/new" className="text-primary hover:underline">Add your first product</Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((p) => (
                                            <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{p.category?.name || "—"}</td>
                                                <td className="px-4 py-3 font-semibold">{formatCurrency(p.basePrice)}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" asChild title="View">
                                                            <Link href={`/products/${p.id}`}><Eye className="size-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild title="Edit">
                                                            <Link href={`/products/${p.id}/edit`}><Pencil className="size-4" /></Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Delete"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(p.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-border px-4 py-3">
                                <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
