"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star, Search, MessageSquare, TrendingUp, TrendingDown, AlertCircle, Filter } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Category, Product, Review, Page } from "@/types";

function StarRating({ rating, showNumber = false, size = "default" }: { rating: number; showNumber?: boolean; size?: "small" | "default" | "large" }) {
    const starSize = size === "small" ? "size-3" : size === "large" ? "size-5" : "size-4";

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`${starSize} ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                ))}
            </div>
            {showNumber && <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState("all");
    const [selectedRating, setSelectedRating] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

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
            const matchesRating = selectedRating === "all" || review.rating === parseInt(selectedRating);
            const matchesSearch = !searchQuery ||
                review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.productName.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesProduct && matchesRating && matchesSearch;
        });
    }, [products, reviews, selectedCategory, selectedProduct, selectedRating, searchQuery]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalReviews = reviews.length;
        const avgRating = totalReviews ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
        const repliedCount = reviews.filter(r => r.reply).length;
        const pendingCount = reviews.filter(r => !r.reply).length;

        // Rating distribution
        const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: reviews.filter(r => r.rating === star).length,
            percentage: totalReviews ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0
        }));

        // Recent trend (last 30 days vs previous 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentReviews = reviews.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
        const previousReviews = reviews.filter(r => {
            const date = new Date(r.createdAt);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        const recentAvg = recentReviews.length ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length : 0;
        const previousAvg = previousReviews.length ? previousReviews.reduce((s, r) => s + r.rating, 0) / previousReviews.length : 0;
        const trend = recentAvg - previousAvg;

        return {
            totalReviews,
            avgRating,
            repliedCount,
            pendingCount,
            ratingCounts,
            recentCount: recentReviews.length,
            trend
        };
    }, [reviews]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage customer reviews and respond to feedback
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Rating Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                                    <p className="text-sm text-muted-foreground">/ 5.0</p>
                                </div>
                                <StarRating rating={Math.round(stats.avgRating)} size="small" />
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                <Star className="h-6 w-6 text-amber-600 dark:text-amber-500 fill-amber-600 dark:fill-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Reviews Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalReviews}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {stats.trend > 0 ? (
                                        <>
                                            <TrendingUp className="h-3 w-3 text-success" />
                                            <span className="text-xs text-success">+{stats.trend.toFixed(1)} this month</span>
                                        </>
                                    ) : stats.trend < 0 ? (
                                        <>
                                            <TrendingDown className="h-3 w-3 text-destructive" />
                                            <span className="text-xs text-destructive">{stats.trend.toFixed(1)} this month</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No change</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Reviews Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Reply</p>
                                <p className="text-3xl font-bold mt-2">{stats.pendingCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.totalReviews ? Math.round((stats.pendingCount / stats.totalReviews) * 100) : 0}% of total
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Replied Reviews Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Replied</p>
                                <p className="text-3xl font-bold mt-2">{stats.repliedCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.totalReviews ? Math.round((stats.repliedCount / stats.totalReviews) * 100) : 0}% response rate
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-success fill-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rating Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>Breakdown of customer ratings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.ratingCounts.map(({ star, count, percentage }) => (
                            <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16">
                                    <span className="text-sm font-medium">{star}</span>
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-24">
                                    <span className="text-sm font-medium">{count}</span>
                                    <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search reviews by customer, product, or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                Showing {filteredReviews.length} of {stats.totalReviews} reviews
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All ratings" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All ratings</SelectItem>
                                            <SelectItem value="5">5 Stars</SelectItem>
                                            <SelectItem value="4">4 Stars</SelectItem>
                                            <SelectItem value="3">3 Stars</SelectItem>
                                            <SelectItem value="2">2 Stars</SelectItem>
                                            <SelectItem value="1">1 Star</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
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

                                <div className="space-y-2">
                                    <Label>Product</Label>
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
                        )}
                    </div>
                </CardContent>
            </Card>

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
    );
}
