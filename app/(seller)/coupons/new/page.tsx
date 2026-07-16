"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useState } from "react";

const schema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.string().min(1, "Required"),
    minimumOrderAmount: z.string().optional(),
    maxUsageCount: z.string().optional(),
    expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewCouponPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { discountType: "PERCENTAGE" },
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            await api.post("/api/v1/coupons", {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: parseFloat(data.discountValue),
                minimumOrderAmount: data.minimumOrderAmount ? parseFloat(data.minimumOrderAmount) : undefined,
                maxUsageCount: data.maxUsageCount ? parseInt(data.maxUsageCount) : undefined,
                expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
            });
            router.push("/coupons");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || "Failed to create coupon.");
        }
    };

    return (
        <Shell title="Create Coupon">
            <div className="max-w-lg space-y-5">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/coupons"><ArrowLeft className="size-4" /> Back to Coupons</Link>
                </Button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {error && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

                    <Card>
                        <CardHeader><CardTitle className="text-base">Coupon Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Coupon Code *</Label>
                                <Input
                                    placeholder="SAVE20"
                                    className="uppercase font-mono"
                                    {...register("code")}
                                />
                                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Discount Type *</Label>
                                    <Select defaultValue="PERCENTAGE" onValueChange={(v) => setValue("discountType", v as "PERCENTAGE" | "FIXED")}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                            <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Discount Value *</Label>
                                    <Input type="number" step="0.01" placeholder="20" {...register("discountValue")} />
                                    {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/coupons">Cancel</Link>
                        </Button>
                        <Button type="submit" loading={isSubmitting}>Create Coupon</Button>
                    </div>
                </form>
            </div>
        </Shell>
    );
}
