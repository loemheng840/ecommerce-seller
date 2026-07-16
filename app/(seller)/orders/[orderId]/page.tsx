"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderItem, ShipmentStatus } from "@/types";

const STORE_ID = "00000000-0000-0000-0000-000000000000";

const SHIPMENT_STATUSES: ShipmentStatus[] = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "DELIVERED", "RETURNED"];

const SHIPMENT_VARIANTS: Record<ShipmentStatus, "default" | "success" | "warning" | "info" | "destructive" | "secondary"> = {
    PENDING: "warning",
    PACKED: "info",
    SHIPPED: "default",
    IN_TRANSIT: "default",
    DELIVERED: "success",
    RETURNED: "destructive",
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Order>(`/api/v1/stores/${STORE_ID}/orders/${orderId}`)
            .then(r => setOrder(r.data))
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [orderId]);

    const updateShipment = async (itemId: string, status: ShipmentStatus) => {
        await api.put(
            `/api/v1/stores/${STORE_ID}/orders/${orderId}/items/${itemId}/shipment-status`,
            null,
            { params: { status } }
        );
        // Refresh
        const res = await api.get<Order>(`/api/v1/stores/${STORE_ID}/orders/${orderId}`);
        setOrder(res.data);
    };

    if (loading) return (
        <Shell title="Order Detail">
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                ))}
            </div>
        </Shell>
    );

    if (!order) return (
        <Shell title="Order Not Found">
            <div className="text-center py-20 text-muted-foreground">
                <p>Order not found.</p>
                <Button asChild className="mt-4"><Link href="/orders">Back to Orders</Link></Button>
            </div>
        </Shell>
    );

    return (
        <Shell title={`Order ${order.orderNumber || orderId.slice(0, 8)}`}>
            <div className="max-w-3xl space-y-5">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders"><ArrowLeft className="size-4" /> Back to Orders</Link>
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{order.orderNumber}</h2>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "info"} className="text-sm px-3 py-1">
                        {order.status}
                    </Badge>
                </div>

                {/* Customer Info */}
                <Card>
                    <CardHeader><CardTitle className="text-sm">Customer Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Name</p>
                            <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Email</p>
                            <p className="font-medium">{order.customerEmail}</p>
                        </div>
                        {order.shippingAddress && (
                            <div className="col-span-2">
                                <p className="text-muted-foreground text-xs mb-1">Shipping Address</p>
                                <p className="font-medium">{order.shippingAddress}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {order.items?.map((item: OrderItem) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Package className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="font-semibold text-sm">{formatCurrency(item.totalPrice)}</p>
                                    <Select
                                        value={item.shipmentStatus}
                                        onValueChange={(v) => updateShipment(item.id, v as ShipmentStatus)}
                                    >
                                        <SelectTrigger className="w-36 h-7 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SHIPMENT_STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Badge variant={SHIPMENT_VARIANTS[item.shipmentStatus]} className="text-xs">
                                        {item.shipmentStatus}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Order Total</span>
                            <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
