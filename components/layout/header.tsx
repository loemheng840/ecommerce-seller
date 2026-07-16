"use client";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
    title?: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 h-9 rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground w-56">
                    <Search className="size-4 shrink-0" />
                    <span>Search…</span>
                </div>

                {/* Notifications */}
                <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="size-4" />
                        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                    </Button>
                </Link>

                {/* Avatar */}
                <Avatar className="size-8 cursor-pointer">
                    <AvatarImage src="" alt="Seller" />
                    <AvatarFallback>SE</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
