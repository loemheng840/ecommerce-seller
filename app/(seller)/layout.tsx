import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Bell, Search } from "lucide-react";

export default function SellerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
                    <h1 className="text-lg font-semibold text-foreground">Seller Workspace</h1>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 h-9 w-64 rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground">
                            <Search className="size-4" />
                            <span>Search products, orders...</span>
                        </div>
                        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted hover:bg-accent transition-colors">
                            <Bell className="size-4" />
                        </button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            SE
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}          

