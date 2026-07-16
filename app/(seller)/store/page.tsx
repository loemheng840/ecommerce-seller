"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shell } from "@/components/layout/shell";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Store, CheckCircle2, Clock, XCircle, AlertTriangle,
    ArrowRight, Edit3, Save, RefreshCw, ShieldAlert,
    Star, ThumbsDown, ThumbsUp, MessageSquare,
} from "lucide-react";
import api from "@/lib/api";
import { useSellerStore } from "@/lib/useStore";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Store as StoreType, StoreStatusHistory, Review } from "@/types";

// ── Form schema ───────────────────────────────────────────────────────────────
const schema = z.object({
    name: z.string().min(2, "At least 2 characters"),
    slug: z.string().min(2, "At least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
    description: z.string().min(10, "At least 10 characters"),
    contactInfo: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
    ACTIVE: { label: "Active", color: "success", icon: CheckCircle2, bg: "bg-success/10 border-success/20 text-success", msg: "Your store is live and accepting orders." },
    PENDING_APPROVAL: { label: "Pending Approval", color: "warning", icon: Clock, bg: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300", msg: "Your store is under review. Usually approved within 24 hours." },
    SUSPENDED: { label: "Suspended", color: "destructive", icon: AlertTriangle, bg: "bg-destructive/10 border-destructive/20 text-destructive", msg: "Your store has been suspended. Please contact support." },
    REJECTED: { label: "Rejected", color: "destructive", icon: XCircle, bg: "bg-destructive/10 border-destructive/20 text-destructive", msg: "Your store application was rejected. You may create a new store." },
    INACTIVE: { label: "Inactive", color: "secondary", icon: Store, bg: "bg-muted border-border text-muted-foreground", msg: "Your store is currently inactive." },
} as const;

export default function StoreProfilePage() {
    const { store, storeId, loading, error: storeError, setStore, refresh } = useSellerStore();
    const [history, setHistory] = useState<StoreStatusHistory[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [editing, setEditing] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    // Populate form when store loads
    useEffect(() => {
        if (!store) return;
        reset({
            name: store.name,
            slug: store.slug,
            description: store.description,
            contactInfo: store.contactInfo ?? "",
        });
    }, [store, reset]);

    // Fetch audit history (seller can see own store history)
    useEffect(() => {
        if (!storeId) return;
        api.get<StoreStatusHistory[]>(`/api/v1/stores/${storeId}/audit-history`)
            .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
            .catch(() => setHistory([]));
    }, [storeId]);

    // Fetch store reviews
    useEffect(() => {
        if (!storeId) return;
        api.get<Review[]>(`/api/v1/stores/${storeId}/reviews`)
            .then(r => setReviews(Array.isArray(r.data) ? r.data : []))
            .catch(() => setReviews([]));
    }, [storeId]);

    const onSubmit = async (data: FormData) => {
        setSaveError(null);
        try {
            const res = await api.put<StoreType>(`/api/v1/stores/${storeId}`, {
                name: data.name,
                slug: data.slug,
                description: data.description,
                contactInfo: data.contactInfo,
            });
            setStore(res.data);
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setSaveError(msg ?? "Failed to update store.");
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <Shell title="Store Management">
                <div className="max-w-3xl space-y-4">
                    <div className="h-32 bg-muted animate-pulse rounded-2xl" />
                    <div className="h-64 bg-muted animate-pulse rounded-2xl" />
                </div>
            </Shell>
        );
    }

    // ── No store found ────────────────────────────────────────────────────────
    if (storeError || !store) {
        return (
            <Shell title="Store Management">
                <div className="max-w-md">
                    <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
                        <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-muted">
                            <ShieldAlert className="size-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">No Store Found</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {storeError ?? "You don't have a store yet. Create one to start selling."}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={refresh}>
                                <RefreshCw className="size-4" /> Retry
                            </Button>
                            <Button asChild>
                                <a href="/onboarding">Create Store <ArrowRight className="size-4" /></a>
                            </Button>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    const cfg = STATUS[store.status] ?? STATUS.INACTIVE;
    const StatusIcon = cfg.icon;

    // ── Review helpers ──────────────────────────────────────────────────────
    const getRatingCategory = (rating: number) => {
        if (rating >= 1 && rating <= 2) return 'bad';
        if (rating >= 3 && rating <= 5) return 'good';
        return 'neutral';
    };

    const getRatingStyle = (rating: number) => {
        const category = getRatingCategory(rating);
        switch (category) {
            case 'bad':
                return {
                    bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
                    textColor: 'text-red-800 dark:text-red-300',
                    iconColor: 'text-red-600 dark:text-red-400',
                    icon: ThumbsDown,
                    label: 'Bad'
                };
            case 'good':
                return {
                    bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
                    textColor: 'text-green-800 dark:text-green-300',
                    iconColor: 'text-green-600 dark:text-green-400',
                    icon: ThumbsUp,
                    label: 'Good'
                };
            default:
                return {
                    bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
                    textColor: 'text-gray-800 dark:text-gray-300',
                    iconColor: 'text-gray-600 dark:text-gray-400',
                    icon: Star,
                    label: 'Average'
                };
        }
    };

    const renderStarRating = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`size-3 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                    {rating}
                </span>
            </div>
        );
    };

    const ReviewCard = ({ review }: { review: Review }) => {
        const style = getRatingStyle(review.rating);
        const CategoryIcon = style.icon;

        return (
            <Card className={`border ${style.bgColor}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`gap-1 ${style.textColor} border-current`}>
                                    <CategoryIcon className="size-3" />
                                    {style.label}
                                </Badge>
                                {renderStarRating(review.rating)}
                            </div>
                            <CardTitle className={`text-sm ${style.textColor}`}>
                                {review.productName}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                by {review.customerName} • {formatRelativeTime(review.createdAt)}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                {review.comment && (
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <MessageSquare className="size-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Review</span>
                                </div>
                                <p className={`text-sm leading-relaxed ${style.textColor}`}>
                                    "{review.comment}"
                                </p>
                            </div>
                            {review.reply && (
                                <div className="pl-4 border-l-2 border-primary/20">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Store className="size-3 text-primary" />
                                        <span className="text-xs text-primary font-medium">Store Reply</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {review.reply}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>
        );
    };

    return (
        <Shell title="Store Management">
            <div className="max-w-3xl space-y-5">

                {/* ── Hero card ─────────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    {/* Banner */}
                    <div className="h-16 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
                    {/* Identity row */}
                    <div className="px-5 pb-4 -mt-7 flex items-end justify-between gap-3">
                        <div className="flex items-end gap-3">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground shadow">
                                <Store className="size-6" />
                            </div>
                            <div className="pb-0.5">
                                <h2 className="text-lg font-bold leading-tight">{store.name}</h2>
                                <p className="text-xs text-muted-foreground">/{store.slug}</p>
                            </div>
                        </div>
                        <Badge
                            variant={cfg.color as "default"}
                            className="mb-1 gap-1.5 shrink-0"
                        >
                            <StatusIcon className="size-3" />
                            {cfg.label}
                        </Badge>
                    </div>
                </div>

                {/* ── Status banner (non-ACTIVE stores) ─────────────────────────── */}
                {store.status !== "ACTIVE" && (
                    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${cfg.bg}`}>
                        <StatusIcon className="size-4 shrink-0 mt-0.5" />
                        <p>{cfg.msg}</p>
                    </div>
                )}

                {/* ── Toast alerts ───────────────────────────────────────────────── */}
                {saved && (
                    <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                        <CheckCircle2 className="size-4" /> Store profile updated successfully.
                    </div>
                )}
                {saveError && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <XCircle className="size-4" /> {saveError}
                    </div>
                )}

                {/* ── Tabs ───────────────────────────────────────────────────────── */}
                <Tabs defaultValue="profile">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="history">Status History</TabsTrigger>
                    </TabsList>

                    {/* ── Profile tab ─────────────────────────────────────────────── */}
                    <TabsContent value="profile" className="mt-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-base">Store Information</CardTitle>
                                        <CardDescription className="text-xs">
                                            Only you can edit your own store.
                                        </CardDescription>
                                    </div>
                                    {!editing ? (
                                        <Button
                                            type="button" variant="outline" size="sm"
                                            onClick={() => setEditing(true)}
                                        >
                                            <Edit3 className="size-4" /> Edit
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button" variant="ghost" size="sm"
                                            onClick={() => { setEditing(false); reset(); setSaveError(null); }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-5">
                                    {!editing ? (
                                        /* ── Read-only view ─── */
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Store Name</dt>
                                                <dd className="text-sm font-medium mt-0.5">{store.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Slug</dt>
                                                <dd className="text-sm font-medium mt-0.5 font-mono">/{store.slug}</dd>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <dt className="text-xs text-muted-foreground">Description</dt>
                                                <dd className="text-sm mt-0.5 leading-relaxed">{store.description}</dd>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <dt className="text-xs text-muted-foreground">Contact Info</dt>
                                                <dd className="text-sm mt-0.5">{store.contactInfo || "—"}</dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        /* ── Edit form ─── */
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label>Store Name *</Label>
                                                <Input placeholder="My Store" {...register("name")} />
                                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>URL Slug *</Label>
                                                <div className="flex items-center rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring bg-background">
                                                    <span className="bg-muted px-3 py-2 text-sm text-muted-foreground border-r border-border whitespace-nowrap">
                                                        store/
                                                    </span>
                                                    <input
                                                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                                                        placeholder="my-store"
                                                        {...register("slug")}
                                                    />
                                                </div>
                                                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Description *</Label>
                                                <Textarea
                                                    rows={4}
                                                    placeholder="What do you sell? What makes your store unique?"
                                                    {...register("description")}
                                                />
                                                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Contact Info</Label>
                                                <Input
                                                    placeholder="Phone, email, or business address"
                                                    {...register("contactInfo")}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                                                    <Save className="size-4" /> Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* ── Reviews tab ─────────────────────────────────────────────── */}
                    <TabsContent value="reviews" className="mt-4">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Customer Reviews</CardTitle>
                                    <CardDescription className="text-xs">
                                        Reviews are categorized by rating: 1-2 stars (Bad), 3-5 stars (Good)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {reviews.length === 0 ? (
                                        <div className="py-14 text-center text-sm text-muted-foreground">
                                            <Star className="size-8 mx-auto mb-3 opacity-25" />
                                            No reviews yet. Start getting sales to receive customer feedback!
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Review summary */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
                                                <div className="text-center space-y-1">
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {reviews.length}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Total Reviews</div>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {reviews.filter(r => getRatingCategory(r.rating) === 'good').length}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Good (3-5 ⭐)</div>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <div className="text-2xl font-bold text-red-600">
                                                        {reviews.filter(r => getRatingCategory(r.rating) === 'bad').length}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Bad (1-2 ⭐)</div>
                                                </div>
                                            </div>

                                            {/* Reviews grid */}
                                            <div className="grid gap-4">
                                                {reviews
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .map((review) => (
                                                        <ReviewCard key={review.id} review={review} />
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ── Details tab ─────────────────────────────────────────────── */}
                    <TabsContent value="details" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Store Details</CardTitle>
                                <CardDescription className="text-xs">Technical information about your store account</CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-5">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                    {[
                                        { label: "Store ID", value: store.id },
                                        { label: "Owner ID", value: store.storeOwnerId ?? "—" },
                                        { label: "Status", value: cfg.label },
                                        { label: "Created", value: formatDate(store.createdAt) },
                                        { label: "Last Updated", value: formatRelativeTime(store.updatedAt) },
                                        { label: "Created By", value: (store as { createdBy?: string }).createdBy ?? "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <dt className="text-xs text-muted-foreground">{label}</dt>
                                            <dd className="text-xs font-mono mt-0.5 break-all text-foreground/80">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Status history tab ─────────────────────────────────────── */}
                    <TabsContent value="history" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Status Change History</CardTitle>
                                <CardDescription className="text-xs">Audit trail of all status transitions</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {history.length === 0 ? (
                                    <div className="py-14 text-center text-sm text-muted-foreground">
                                        <Clock className="size-8 mx-auto mb-3 opacity-25" />
                                        No status changes recorded yet.
                                    </div>
                                ) : (
                                    <ol className="divide-y divide-border">
                                        {history.map((h, i) => {
                                            const from = STATUS[h.previousStatus as keyof typeof STATUS];
                                            const to = STATUS[h.newStatus as keyof typeof STATUS];
                                            return (
                                                <li key={h.id ?? i} className="flex items-start gap-4 px-5 py-4">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5 text-muted-foreground">
                                                        <ArrowRight className="size-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge variant={(from?.color ?? "secondary") as "default"} className="text-xs">
                                                                {from?.label ?? h.previousStatus}
                                                            </Badge>
                                                            <span className="text-muted-foreground text-xs">→</span>
                                                            <Badge variant={(to?.color ?? "default") as "default"} className="text-xs">
                                                                {to?.label ?? h.newStatus}
                                                            </Badge>
                                                        </div>
                                                        {h.reason && (
                                                            <p className="text-xs text-muted-foreground">{h.reason}</p>
                                                        )}
                                                    </div>
                                                    <time className="text-xs text-muted-foreground shrink-0">
                                                        {formatRelativeTime(h.changedAt)}
                                                    </time>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Shell>
    );
}
