"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

const STORE_ID = "00000000-0000-0000-0000-000000000000";

// Fallback mock data when API not yet connected
const mockWeekly = [
    { date: "Mon", revenue: 1200, orders: 18 },
    { date: "Tue", revenue: 1850, orders: 24 },
    { date: "Wed", revenue: 1400, orders: 19 },
    { date: "Thu", revenue: 2200, orders: 31 },
    { date: "Fri", revenue: 1950, orders: 27 },
    { date: "Sat", revenue: 2800, orders: 38 },
    { date: "Sun", revenue: 3100, orders: 42 },
];

const mockMonthly = Array.from({ length: 30 }, (_, i) => ({
    date: `Jul ${i + 1}`,
    revenue: Math.floor(1000 + Math.random() * 3000),
    orders: Math.floor(10 + Math.random() * 50),
}));

export default function SalesAnalyticsPage() {
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [data, setData] = useState(mockWeekly);

    useEffect(() => {
        // Attempt to fetch real data; fall back to mock silently
        api.get(`/api/v1/reports/sales/${STORE_ID}`, { params: { period } })
            .then(r => { if (r.data?.length) setData(r.data); })
            .catch(() => setData(period === "week" ? mockWeekly : mockMonthly));
    }, [period]);

    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = data.reduce((s, d) => s + d.orders, 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

    return (
        <Shell title="Sales Analytics">
            <div className="space-y-5">
                {/* Sub-nav */}
                <div className="flex gap-2 text-sm flex-wrap">
                    {[
                        { label: "Sales", href: "/analytics/sales" },
                        { label: "Orders", href: "/analytics/orders" },
                        { label: "Inventory", href: "/analytics/inventory" },
                        { label: "Store", href: "/analytics/store" },
                    ].map(({ label, href }) => (
                        <Link key={href} href={href}>
                            <Button variant={href === "/analytics/sales" ? "default" : "outline"} size="sm">{label}</Button>
                        </Link>
                    ))}
                </div>

                {/* Period tabs */}
                <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
                    <TabsList>
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="month">This Month</TabsTrigger>
                    </TabsList>

                    <TabsContent value={period}>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5 mt-1">
                            {[
                                { label: "Total Revenue", value: formatCurrency(totalRevenue) },
                                { label: "Total Orders", value: totalOrders.toString() },
                                { label: "Avg. Order Value", value: formatCurrency(avgOrder) },
                            ].map(({ label, value }) => (
                                <Card key={label}>
                                    <CardContent className="pt-5">
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        <p className="text-2xl font-bold mt-1">{value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Revenue chart */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                                        <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Revenue"]} contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--color-border)" }} />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Orders chart */}
                        <Card className="mt-4">
                            <CardHeader><CardTitle className="text-sm">Orders</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid var(--color-border)" }} />
                                        <Bar dataKey="orders" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Shell>
    );
}
