"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Category, Product, Review, Page } from "@/types";

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`size-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState("all");
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const [reviewsRes, categoriesRes, productsRes] = await Promise.all([
                api.get<Page<Review> | Review[]>("/api/v1/reviews/store"),
                api.get<Category[] | { content?: Category[] }>("/api/v1/categories"),
                api.get<Product[] | { content?: Product[] }>("/api/v1/products"),
            ]);

            const reviewData = reviewsRes.data;
            const categoryData = categoriesRes.data;
            const productData = productsRes.data;

            setReviews(Array.isArray(reviewData) ? reviewData : (reviewData as Page<Review>).content || []);
            setCategories(Array.isArray(categoryData) ? categoryData : (categoryData as { content?: Category[] }).content || []);
            setProducts(Array.isArray(productData) ? productData : (productData as { content?: Product[] }).content || []);
        } catch {
            setReviews([]);
            setCategories([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchReviews(); }, [fetchReviews]);

    const submitReply = async (reviewId: string) => {
        const text = replyText[reviewId];
        if (!text?.trim()) return;
        setSubmitting(reviewId);
        try {
            await api.post(`/api/v1/reviews/${reviewId}/reply`, { reply: text });
            setReplyText(prev => ({ ...prev, [reviewId]: "" }));
            fetchReviews();
        } finally {
            setSubmitting(null);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const product = products.find((entry) => entry.id === review.productId);
            const category = product?.category?.name ?? "Uncategorized";

            const matchesCategory = selectedCategory === "all" || category === selectedCategory;
            const matchesProduct = selectedProduct === "all" || review.productId === selectedProduct;

            return matchesCategory && matchesProduct;
        });
    }, [products, reviews, selectedCategory, selectedProduct]);

    const avgRating = filteredReviews.length
        ? filteredReviews.reduce((s, r) => s + r.rating, 0) / filteredReviews.length
        : 0;

    return (
        <Shell title="Reviews">
            <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-5">
                    <div className="text-center">
                        <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
                        <StarRating rating={Math.round(avgRating)} />
                        <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-3">{star}</span>
                                    <Star className="size-3 fill-amber-400 text-amber-400" />
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label>Filter by category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Filter by product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="All products" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All products</SelectItem>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
                        ))
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">No reviews match the current filters</div>
                    ) : (
                        filteredReviews.map((r) => {
                            const product = products.find((entry) => entry.id === r.productId);
                            const categoryName = product?.category?.name ?? "Uncategorized";

                            return (
                                <Card key={r.id}>
                                    <CardContent className="pt-5 space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{r.customerName}</p>
                                                <StarRating rating={r.rating} />
                                                <p className="text-xs text-muted-foreground">{r.productName} · {categoryName} · {formatDate(r.createdAt)}</p>
                                            </div>
                                            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                {r.rating}/5 stars
                                            </div>
                                        </div>

                                        {r.comment && (
                                            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                                                <p className="mt-1 text-sm text-foreground">{r.comment}</p>
                                            </div>
                                        )}

                                        {r.reply && (
                                            <div className="rounded-xl bg-muted px-4 py-3 text-sm border-l-2 border-primary">
                                                <p className="text-xs font-semibold text-primary mb-1">Your reply</p>
                                                <p>{r.reply}</p>
                                            </div>
                                        )}

                                        {!r.reply && (
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Write a reply to this review…"
                                                    rows={2}
                                                    value={replyText[r.id] || ""}
                                                    onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => submitReply(r.id)}
                                                    loading={submitting === r.id}
                                                    disabled={!replyText[r.id]?.trim()}
                                                >
                                                    Post Reply
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </Shell>
    );
}
