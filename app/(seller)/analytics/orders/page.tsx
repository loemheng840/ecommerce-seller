"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useSellerStore } from "@/lib/useStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, Page } from "@/types";

export default function OrdersAnalyticsPage() {
    const { storeId } = useSellerStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<{ totalOrders: number; pendingOrders: number; completedOrders: number; revenue: number } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            const [ordersRes, summaryRes] = await Promise.all([
                api.get<Page<Order>>(`/api/v1/stores/${storeId}/reports/orders`),
                api.get<{ totalOrders: number; pendingOrders: number; completedOrders: number; revenue: number }>(`/api/v1/stores/${storeId}/reports/orders/summary`),
            ]);
            const content = Array.isArray(ordersRes.data?.content) ? ordersRes.data.content : [];
            setOrders(content);
            setSummary(summaryRes.data);
        } catch {
            setOrders([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchOrders(); }, [fetchOrders]);

    return (
        <Shell title="Order Analytics">
            <div className="space-y-5">
                <div className="flex gap-2 text-sm flex-wrap">
                    {[
                        { label: "Sales", href: "/analytics/sales" },
                        { label: "Orders", href: "/analytics/orders" },
                        { label: "Inventory", href: "/analytics/inventory" },
                    ].map(({ label, href }) => (
                        <Link key={href} href={href}>
                            <Button variant={href === "/analytics/orders" ? "default" : "outline"} size="sm">{label}</Button>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary?.totalOrders ?? 0}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Orders</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary?.pendingOrders ?? 0}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary ? formatCurrency(summary.revenue) : "—"}</p></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-sm">Order Report Feed</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Order</th>
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Revenue</th>
                                        <th className="px-4 py-3 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></td>
                                                <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                                            </tr>
                                        ))
                                    ) : orders.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No order report data found</td></tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                                                <td className="px-4 py-3">{order.customerName}</td>
                                                <td className="px-4 py-3"><Badge>{order.status}</Badge></td>
                                                <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
