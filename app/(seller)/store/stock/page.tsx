"use client";

import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Boxes, DollarSign } from "lucide-react";
import api from "@/lib/api";
import { useSellerStore } from "@/lib/useStore";
import { formatCurrency } from "@/lib/utils";
import type { Page, StockItem, StockSummary } from "@/types";

export default function StoreStockPage() {
    const { storeId } = useSellerStore();
    const [items, setItems] = useState<StockItem[]>([]);
    const [summary, setSummary] = useState<StockSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStock = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            const [lowRes, outRes, valueRes] = await Promise.all([
                api.get<Page<StockItem>>(`/api/v1/stock/stores/${storeId}/low-stock`),
                api.get<Page<StockItem>>(`/api/v1/stock/stores/${storeId}/out-of-stock`),
                api.get<StockSummary>(`/api/v1/stock/stores/${storeId}/total-inventory-value`),
            ]);

            const lowItems = Array.isArray(lowRes.data?.content) ? lowRes.data.content : [];
            const outItems = Array.isArray(outRes.data?.content) ? outRes.data.content : [];
            const stockItems = [...lowItems, ...outItems];

            setItems(stockItems);
            setSummary(valueRes.data);
        } catch {
            setItems([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchStock(); }, [fetchStock]);

    return (
        <Shell title="Store Stock">
            <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Value</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <DollarSign className="size-5 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{summary ? formatCurrency(summary.totalInventoryValue) : "—"}</p>
                                <p className="text-xs text-muted-foreground">total value in stock</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Low Stock Items</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-destructive" />
                            <div>
                                <p className="text-2xl font-bold">{summary?.lowStockCount ?? 0}</p>
                                <p className="text-xs text-muted-foreground">products below threshold</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Out of Stock</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <Boxes className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{summary?.outOfStockCount ?? 0}</p>
                                <p className="text-xs text-muted-foreground">products with 0 quantity</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Quantity</th>
                                        <th className="px-4 py-3 font-medium">Threshold</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                                            </tr>
                                        ))
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No stock alerts found</td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                <td className="px-4 py-3">{item.quantity}</td>
                                                <td className="px-4 py-3">{item.lowStockThreshold}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={item.quantity === 0 ? "destructive" : "warning"}>
                                                        {item.quantity === 0 ? "Out of stock" : "Low stock"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Inventory endpoints mapped</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><span className="font-semibold text-foreground">GET</span> /api/v1/stock/stores/{storeId}/low-stock</p>
                        <p><span className="font-semibold text-foreground">GET</span> /api/v1/stock/stores/{storeId}/out-of-stock</p>
                        <p><span className="font-semibold text-foreground">GET</span> /api/v1/stock/stores/{storeId}/total-inventory-value</p>
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
