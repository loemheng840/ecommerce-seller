"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useSellerStore } from "@/lib/useStore";
import { formatCurrency } from "@/lib/utils";
import type { Coupon, Page } from "@/types";

const discountSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.string().min(1, "Required"),
    minimumOrderAmount: z.string().optional(),
    maxUsageCount: z.string().optional(),
    expiresAt: z.string().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export default function DiscountsPage() {
    const { storeId } = useSellerStore();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DiscountFormData>({
        resolver: zodResolver(discountSchema),
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
        if (!storeId) return;
        setLoading(true);
        try {
            const res = await api.get<Page<Coupon>>(`/api/v1/stores/${storeId}/coupons`);
            setCoupons(Array.isArray(res.data?.content) ? res.data.content : []);
        } catch {
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchCoupons(); }, [fetchCoupons]);

    const toggleCouponStatus = async (couponId: string, active: boolean) => {
        if (!storeId) return;
        await api.patch(`/api/v1/stores/${storeId}/coupons/${couponId}/status?active=${active}`);
        await fetchCoupons();
    };

    const onSubmit = async (data: DiscountFormData) => {
        if (!storeId) return;
        setFormError(null);
        try {
            await api.post(`/api/v1/stores/${storeId}/coupons`, {
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
            setFormError(message ?? "Failed to create discount.");
        }
    };

    return (
        <Shell title="Discounts">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Store Coupons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="h-20 rounded bg-muted animate-pulse" />
                        ) : coupons.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No coupons created yet.</p>
                        ) : (
                            coupons.map((coupon) => (
                                <div key={coupon.id} className="rounded-xl border border-border px-3 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{coupon.code}</p>
                                            <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</p>
                                            <Badge variant={coupon.isActive ? "success" : "secondary"}>{coupon.isActive ? "Active" : "Inactive"}</Badge>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => toggleCouponStatus(coupon.id, !coupon.isActive)}>
                                            {coupon.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="h-fit xl:sticky xl:top-6">
                    <CardHeader>
                        <CardTitle className="text-base">Create Discount</CardTitle>
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
                                {isSubmitting ? "Creating Discount" : "Create Discount"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Shell>
    );
}
