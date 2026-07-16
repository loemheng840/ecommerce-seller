"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Package, Store, Star, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
    ORDER: ShoppingCart,
    STOCK: Package,
    STORE: Store,
    REVIEW: Star,
    SYSTEM: Bell,
};

const TYPE_COLORS: Record<NotificationType, string> = {
    ORDER: "bg-primary/10 text-primary",
    STOCK: "bg-destructive/10 text-destructive",
    STORE: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    REVIEW: "bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400",
    SYSTEM: "bg-muted text-muted-foreground",
};

const FILTER_OPTIONS: Array<{ value: NotificationType | "ALL"; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "ORDER", label: "Orders" },
    { value: "STOCK", label: "Low Stock" },
    { value: "REVIEW", label: "Reviews" },
    { value: "STORE", label: "Store" },
    { value: "SYSTEM", label: "System" },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<NotificationType | "ALL">("ALL");

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<Notification[] | { content: Notification[] }>("/api/v1/notifications");
            const data = res.data;
            setNotifications(Array.isArray(data) ? data : data.content || []);
        } catch {
            // Use mock data when API not connected
            setNotifications([
                { id: "1", type: "ORDER", title: "New Order", message: "You have a new order #ORD-042 for $129.99", isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
                { id: "2", type: "STOCK", title: "Low Stock", message: "iPhone Case - Black is running low (3 left)", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
                { id: "3", type: "REVIEW", title: "New Review", message: "Alice Wong left a 5-star review on USB-C Hub Pro", isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
                { id: "4", type: "STORE", title: "Store Approved", message: "Congratulations! Your store is now active.", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

    const markAllRead = async () => {
        try {
            await api.post("/api/v1/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    const markRead = async (id: string) => {
        try {
            await api.post(`/api/v1/notifications/${id}/read`);
        } catch {/* noop */ }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = useMemo(() => {
        if (selectedFilter === "ALL") return notifications;
        return notifications.filter((notification) => notification.type === selectedFilter);
    }, [notifications, selectedFilter]);

    return (
        <Shell title="Notifications">
            <div className="max-w-3xl space-y-5">
                {/* Header row */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                variant={selectedFilter === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedFilter(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllRead}>
                                <CheckCheck className="size-4" /> Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
                        ))
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Bell className="size-10 mx-auto mb-3 opacity-30" />
                            <p>No notifications in this category yet</p>
                        </div>
                    ) : (
                        filteredNotifications.map((n) => {
                            const Icon = TYPE_ICONS[n.type];
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => !n.isRead && markRead(n.id)}
                                    className={`flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5 border-primary/20 hover:bg-primary/10" : "bg-card hover:bg-muted/50"
                                        }`}
                                >
                                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLORS[n.type]}`}>
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm">{n.title}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!n.isRead && <span className="size-2 rounded-full bg-primary mt-1" />}
                                                <span className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Shell>
    );
}
