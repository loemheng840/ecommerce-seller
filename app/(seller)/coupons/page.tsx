"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Coupon, Page } from "@/types";

const couponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.string().min(1, "Required"),
    minimumOrderAmount: z.string().optional(),
    maxUsageCount: z.string().optional(),
    expiresAt: z.string().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CouponFormData>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            discountType: "PERCENTAGE",
            discountValue: "",
            minimumOrderAmount: "",
            maxUsageCount: "",
            expiresAt: "",
        },
    });

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<Page<Coupon> | Coupon[]>("/api/v1/coupons");
            const data = res.data;
            setCoupons(Array.isArray(data) ? data : (data as Page<Coupon>).content || []);
        } catch {
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this coupon?")) return;
        await api.delete(`/api/v1/coupons/${id}`);
        fetchCoupons();
    };

    const copyCode = (code: string) => navigator.clipboard.writeText(code);

    const onSubmit = async (data: CouponFormData) => {
        setFormError(null);
        try {
            await api.post("/api/v1/coupons", {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: Number(data.discountValue),
                minimumOrderAmount: data.minimumOrderAmount ? Number(data.minimumOrderAmount) : undefined,
                maxUsageCount: data.maxUsageCount ? Number(data.maxUsageCount) : undefined,
                expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
            });
            reset();
            await fetchCoupons();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setFormError(message ?? "Failed to create coupon.");
        }
    };

    return (
        <Shell title="Coupons">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
                            ))
                        ) : coupons.length === 0 ? (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                No coupons yet.
                            </div>
                        ) : (
                            coupons.map((c) => {
                                const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                                return (
                                    <Card key={c.id} className={!c.isActive || isExpired ? "opacity-60" : ""}>
                                        <CardContent className="pt-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-base font-bold tracking-widest">{c.code}</span>
                                                    <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-foreground">
                                                        <Copy className="size-3.5" />
                                                    </button>
                                                </div>
                                                <Badge variant={!c.isActive || isExpired ? "secondary" : "success"}>
                                                    {isExpired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            <p className="text-2xl font-bold">
                                                {c.discountType === "PERCENTAGE"
                                                    ? `${c.discountValue}% OFF`
                                                    : `${formatCurrency(c.discountValue)} OFF`}
                                            </p>

                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                {c.minimumOrderAmount && (
                                                    <p>Min. order: {formatCurrency(c.minimumOrderAmount)}</p>
                                                )}
                                                {c.maxUsageCount && (
                                                    <p>Usage: {c.usedCount} / {c.maxUsageCount}</p>
                                                )}
                                                {c.expiresAt && (
                                                    <p>Expires: {formatDate(c.expiresAt)}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <Button variant="outline" size="sm" asChild className="flex-1">
                                                    <Link href={`/coupons/${c.id}/edit`}><Pencil className="size-3" /> Edit</Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(c.id)}
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                <Card className="h-fit xl:sticky xl:top-6">
                    <CardHeader>
                        <CardTitle className="text-base">Create Coupon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {formError && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{formError}</div>}

                            <div className="space-y-1.5">
                                <Label>Coupon Code *</Label>
                                <Input placeholder="SAVE20" className="uppercase font-mono" {...register("code")} />
                                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Discount Type *</Label>
                                    <Select defaultValue="PERCENTAGE" onValueChange={(value) => setValue("discountType", value as "PERCENTAGE" | "FIXED")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                            <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Discount Value *</Label>
                                    <Input type="number" step="0.01" placeholder="20" {...register("discountValue")} />
                                    {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Min. Order Amount</Label>
                                    <Input type="number" step="0.01" placeholder="0.00" {...register("minimumOrderAmount")} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Max Usage Count</Label>
                                    <Input type="number" placeholder="Unlimited" {...register("maxUsageCount")} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Expiry Date</Label>
                                <Input type="datetime-local" {...register("expiresAt")} />
                            </div>

                            <Button type="submit" className="w-full" loading={isSubmitting}>
                                {isSubmitting ? "Creating Coupon" : "Create Coupon"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
