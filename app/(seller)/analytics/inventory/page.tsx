"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useSellerStore } from "@/lib/useStore";
import { formatCurrency } from "@/lib/utils";
import type { Page, StockItem, StockSummary } from "@/types";

export default function InventoryAnalyticsPage() {
    const { storeId } = useSellerStore();
    const [summary, setSummary] = useState<StockSummary | null>(null);
    const [lowStock, setLowStock] = useState<StockItem[]>([]);
    const [outOfStock, setOutOfStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            const [summaryRes, lowRes, outRes] = await Promise.all([
                api.get<StockSummary>(`/api/v1/stores/${storeId}/reports/inventory/summary`),
                api.get<Page<StockItem>>(`/api/v1/stores/${storeId}/reports/inventory/low-stock`),
                api.get<Page<StockItem>>(`/api/v1/stores/${storeId}/reports/inventory/out-of-stock`),
            ]);
            setSummary(summaryRes.data);
            setLowStock(Array.isArray(lowRes.data?.content) ? lowRes.data.content : []);
            setOutOfStock(Array.isArray(outRes.data?.content) ? outRes.data.content : []);
        } catch {
            setSummary(null);
            setLowStock([]);
            setOutOfStock([]);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchAnalytics(); }, [fetchAnalytics]);

    return (
        <Shell title="Inventory Analytics">
            <div className="space-y-5">
                <div className="flex gap-2 text-sm flex-wrap">
                    {[
                        { label: "Sales", href: "/analytics/sales" },
                        { label: "Orders", href: "/analytics/orders" },
                        { label: "Inventory", href: "/analytics/inventory" },
                    ].map(({ label, href }) => (
                        <Link key={href} href={href}>
                            <Button variant={href === "/analytics/inventory" ? "default" : "outline"} size="sm">{label}</Button>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Listings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.totalListings ?? 0}</p></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Low Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.lowStockCount ?? 0}</p></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Out of Stock</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.outOfStockCount ?? 0}</p></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary ? formatCurrency(summary.totalInventoryValue) : "—"}</p></CardContent></Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Low Stock Report</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {loading ? (
                                <div className="h-20 rounded bg-muted animate-pulse" />
                            ) : lowStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No low-stock items</p>
                            ) : (
                                lowStock.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                                        <span>{item.productName}</span>
                                        <Badge variant="warning">{item.quantity} left</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Out of Stock Report</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {loading ? (
                                <div className="h-20 rounded bg-muted animate-pulse" />
                            ) : outOfStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No out-of-stock products</p>
                            ) : (
                                outOfStock.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                                        <span>{item.productName}</span>
                                        <Badge variant="destructive">0 qty</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Shell>
    );
}
