"use client";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown,
    ArrowRight, AlertTriangle, Star,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

// Mock data — replace with real API calls
const stats = [
    { label: "Total Revenue", value: formatCurrency(24580), change: +12.5, icon: DollarSign, color: "text-success" },
    { label: "Total Orders", value: "342", change: +8.2, icon: ShoppingCart, color: "text-primary" },
    { label: "Active Products", value: "48", change: +3, icon: Package, color: "text-amber-600" },
    { label: "Avg. Order Value", value: formatCurrency(71.9), change: -2.1, icon: TrendingUp, color: "text-violet-600" },
];

const chartData = [
    { date: "Jul 9", revenue: 1200, orders: 18 },
    { date: "Jul 10", revenue: 1850, orders: 24 },
    { date: "Jul 11", revenue: 1400, orders: 19 },
    { date: "Jul 12", revenue: 2200, orders: 31 },
    { date: "Jul 13", revenue: 1950, orders: 27 },
    { date: "Jul 14", revenue: 2800, orders: 38 },
    { date: "Jul 15", revenue: 3100, orders: 42 },
];

const recentOrders = [
    { id: "ORD-001", customer: "Alice Wong", amount: 129.99, status: "CONFIRMED", createdAt: "2026-07-15T10:00:00Z" },
    { id: "ORD-002", customer: "Bob Smith", amount: 59.50, status: "PENDING", createdAt: "2026-07-15T09:30:00Z" },
    { id: "ORD-003", customer: "Carol Lee", amount: 215.00, status: "SHIPPED", createdAt: "2026-07-15T08:15:00Z" },
    { id: "ORD-004", customer: "David Park", amount: 89.99, status: "DELIVERED", createdAt: "2026-07-14T22:00:00Z" },
];

const lowStockItems = [
    { name: "iPhone Case - Black", stock: 3 },
    { name: "USB-C Hub Pro", stock: 2 },
    { name: "Wireless Charger", stock: 5 },
];

const statusVariant: Record<string, "default" | "success" | "warning" | "info" | "destructive"> = {
    PENDING: "warning",
    CONFIRMED: "info",
    SHIPPED: "default",
    DELIVERED: "success",
    CANCELLED: "destructive",
};

export default function DashboardPage() {
    return (
        <Shell title="Dashboard">
            <div className="space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(({ label, value, change, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                        <p className="text-2xl font-bold">{value}</p>
                                    </div>
                                    <div className={`flex size-10 items-center justify-center rounded-xl bg-muted ${color}`}>
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-1 text-xs">
                                    {change >= 0
                                        ? <TrendingUp className="size-3 text-success" />
                                        : <TrendingDown className="size-3 text-destructive" />}
                                    <span className={change >= 0 ? "text-success" : "text-destructive"}>
                                        {change >= 0 ? "+" : ""}{change}%
                                    </span>
                                    <span className="text-muted-foreground">vs last week</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold">Revenue (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip
                                        formatter={(val) => [formatCurrency(Number(val)), "Revenue"]}
                                        contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-primary)"
                                        strokeWidth={2}
                                        fill="url(#revenueGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Low Stock */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
                            <AlertTriangle className="size-4 text-destructive" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {lowStockItems.map((item) => (
                                <div key={item.name} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                                    <p className="text-xs font-medium truncate max-w-[160px]">{item.name}</p>
                                    <Badge variant="destructive">{item.stock} left</Badge>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                <Link href="/inventory">View Inventory <ArrowRight className="size-3" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/orders">View all <ArrowRight className="size-3" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="pb-2 font-medium">Order</th>
                                        <th className="pb-2 font-medium">Customer</th>
                                        <th className="pb-2 font-medium">Amount</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="py-3 font-medium text-primary">
                                                <Link href={`/orders/${order.id}`}>{order.id}</Link>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{order.customer}</td>
                                            <td className="py-3 font-semibold">{formatCurrency(order.amount)}</td>
                                            <td className="py-3">
                                                <Badge variant={statusVariant[order.status] || "secondary"}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{formatRelativeTime(order.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Reviews this week", value: "12", icon: Star, href: "/reviews" },
                        { label: "Pending orders", value: "7", icon: ShoppingCart, href: "/orders?status=PENDING" },
                        { label: "Active coupons", value: "3", icon: Package, href: "/coupons" },
                        { label: "Out-of-stock items", value: "5", icon: AlertTriangle, href: "/inventory" },
                    ].map(({ label, value, icon: Icon, href }) => (
                        <Link key={label} href={href}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                    <Icon className="size-8 p-2 rounded-lg bg-muted text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xl font-bold">{value}</p>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </Shell>
    );
}
