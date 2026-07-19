"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, Tag, Star,
    Bell, Settings, Boxes, ChevronLeft, ChevronRight,
    Percent, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navGroups = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Analytics", href: "/analytics/sales", icon: TrendingUp },
            { label: "Reviews", href: "/reviews", icon: Star },
        ],
    },
    {
        label: "Catalog",
        items: [
            { label: "Products", href: "/products", icon: Package },
            { label: "Inventory", href: "/inventory", icon: Boxes },
        ],
    },
    {
        label: "Sales",
        items: [
            { label: "Orders", href: "/orders", icon: ShoppingCart },
            { label: "Coupons", href: "/coupons", icon: Tag },
            { label: "Discounts", href: "/discounts", icon: Percent },
        ],
    },
    {
        label: "Other",
        items: [
            { label: "Notifications", href: "/notifications", icon: Bell },
            { label: "Settings", href: "/settings", icon: Settings },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    // Render simplified version during SSR
    if (!mounted) {
        return (
            <aside className="relative flex h-screen w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
                <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-3 gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                        S
                    </div>
                    <span className="font-semibold text-sm truncate">Seller Portal</span>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className={cn(
                "relative flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 overflow-hidden",
                collapsed ? "w-16" : "w-60"
            )}
        >
            {/* Logo */}
            <div className={cn("flex h-14 shrink-0 items-center border-b border-sidebar-border px-3 gap-3", collapsed && "justify-center")}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                    S
                </div>
                {!collapsed && <span className="font-semibold text-sm truncate">Seller Portal</span>}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
                {navGroups.map((group) => (
                    <div key={group.label} className="mb-1">
                        {!collapsed && (
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                {group.label}
                            </p>
                        )}
                        {group.items.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 mx-2 rounded-xl px-2 py-2 text-sm font-medium transition-colors",
                                    isActive(href)
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? label : undefined}
                            >
                                <Icon className="size-4 shrink-0" />
                                {!collapsed && <span>{label}</span>}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-16 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors z-10"
            >
                {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
            </button>
        </aside>
    );
}
