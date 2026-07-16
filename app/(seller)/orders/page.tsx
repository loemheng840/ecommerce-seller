"use client";
import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus, Page } from "@/types";

const STATUS_VARIANTS: Record<OrderStatus, "default" | "success" | "warning" | "info" | "destructive" | "secondary"> = {
    PENDING: "warning",
    CONFIRMED: "info",
    PROCESSING: "default",
    SHIPPED: "default",
    DELIVERED: "success",
    CANCELLED: "destructive",
    REFUNDED: "secondary",
};

// Replace with your actual store ID from auth context / store state
const STORE_ID = "00000000-0000-0000-0000-000000000000";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, size: 20 };
            if (status !== "all") params.status = status;
            const res = await api.get<Page<Order>>(`/api/v1/stores/${STORE_ID}/orders`, { params });
            setOrders(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [status, page]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = search
        ? orders.filter(o =>
            o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(search.toLowerCase())
        )
        : orders;

    return (
        <Shell title="Orders">
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders…"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex gap-2 flex-wrap">
                    {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as OrderStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(status === s ? "all" : s)}
                            className="text-xs"
                        >
                            <Badge variant={STATUS_VARIANTS[s]} className="cursor-pointer">{s}</Badge>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Order #</th>
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Items</th>
                                        <th className="px-4 py-3 font-medium">Total</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i}>
                                                {Array.from({ length: 7 }).map((__, j) => (
                                                    <td key={j} className="px-4 py-3">
                                                        <div className="h-4 bg-muted animate-pulse rounded" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((o) => (
                                            <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    <Link href={`/orders/${o.id}`}>{o.orderNumber || o.id.slice(0, 8)}</Link>
                                                </td>
                                                <td className="px-4 py-3">{o.customerName}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{o.items?.length ?? "—"}</td>
                                                <td className="px-4 py-3 font-semibold">{formatCurrency(o.totalAmount)}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={STATUS_VARIANTS[o.status]}>{o.status}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/orders/${o.id}`}><Eye className="size-4" /></Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

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
