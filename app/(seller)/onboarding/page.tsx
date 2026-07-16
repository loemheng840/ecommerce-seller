"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { slugify } from "@/lib/utils";

const schema = z.object({
    name: z.string().min(2, "Store name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Step = "form" | "pending";

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>("form");
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const nameValue = watch("name");

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            await api.post("/api/v1/stores", data);
            setStep("pending");
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message || "Failed to create store. Please try again.");
        }
    };

    if (step === "pending") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-md text-center p-10 space-y-5">
                    <div className="flex size-20 mx-auto items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="size-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Store submitted!</h2>
                        <p className="text-muted-foreground">
                            Your store is under review. We&apos;ll notify you by email once it&apos;s approved — usually within 24 hours.
                        </p>
                    </div>
                    <div className="space-y-2 rounded-xl bg-muted p-4 text-left text-sm">
                        <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="size-4" /> Account created
                        </div>
                        <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="size-4" /> Store submitted
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="size-4" /> Awaiting admin approval
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-lg space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Store className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Set up your store</h1>
                    <p className="text-sm text-muted-foreground">Tell us about your store to get started</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Store Information</CardTitle>
                        <CardDescription>This information will be visible to customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
                            )}

                            <div className="space-y-1.5">
                                <Label>Store Name *</Label>
                                <Input
                                    placeholder="My Awesome Store"
                                    {...register("name", {
                                        onChange: (e) => setValue("slug", slugify(e.target.value)),
                                    })}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Store URL Slug *</Label>
                                <div className="flex items-center rounded-xl border border-border overflow-hidden">
                                    <span className="bg-muted px-3 py-2 text-sm text-muted-foreground border-r border-border">
                                        store/
                                    </span>
                                    <input
                                        className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                                        placeholder="my-awesome-store"
                                        {...register("slug")}
                                    />
                                </div>
                                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Description *</Label>
                                <Textarea
                                    placeholder="Tell customers what you sell and what makes your store special…"
                                    rows={4}
                                    {...register("description")}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Business Email</Label>
                                    <Input type="email" placeholder="store@example.com" {...register("email")} />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Phone Number</Label>
                                    <Input type="tel" placeholder="+1 555 000 0000" {...register("phone")} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Business Address</Label>
                                <Input placeholder="123 Main St, City, Country" {...register("address")} />
                            </div>

                            <Button type="submit" className="w-full" loading={isSubmitting}>
                                Submit for Review
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
