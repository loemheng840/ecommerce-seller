"use client";
import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { StockItem } from "@/types";

export default function InventoryPage() {
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showLowOnly, setShowLowOnly] = useState(false);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ content: StockItem[] }>("/api/v1/stock");
            setItems(res.data?.content || (res.data as unknown as StockItem[]) || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const filtered = items.filter((i) => {
        const matchSearch = !search || i.productName.toLowerCase().includes(search.toLowerCase());
        const matchLow = !showLowOnly || i.isLowStock;
        return matchSearch && matchLow;
    });

    const lowStockCount = items.filter(i => i.isLowStock).length;

    return (
        <Shell title="Inventory">
            <div className="space-y-5">
                {/* Alert banner */}
                {lowStockCount > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                        <AlertTriangle className="size-5 text-destructive shrink-0" />
                        <p className="text-sm font-medium text-destructive">
                            {lowStockCount} product{lowStockCount > 1 ? "s are" : " is"} running low on stock.
                        </p>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products…"
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showLowOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowLowOnly(!showLowOnly)}
                    >
                        <AlertTriangle className="size-4" /> Low Stock Only
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Variant</th>
                                        <th className="px-4 py-3 font-medium">Stock</th>
                                        <th className="px-4 py-3 font-medium">Threshold</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i}>
                                                {Array.from({ length: 6 }).map((__, j) => (
                                                    <td key={j} className="px-4 py-3">
                                                        <div className="h-4 bg-muted animate-pulse rounded" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                No inventory data found
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.variantName || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`font-bold ${item.isLowStock ? "text-destructive" : "text-foreground"}`}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.lowStockThreshold}</td>
                                                <td className="px-4 py-3">
                                                    {item.isLowStock
                                                        ? <Badge variant="destructive">Low Stock</Badge>
                                                        : <Badge variant="success">In Stock</Badge>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.lastUpdated)}</td>
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
