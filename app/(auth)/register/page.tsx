"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import Link from "next/link";

const schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            await api.post("/api/v1/auth/register", {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                email: data.email,
                password: data.password,
                role: "SELLER",
            });
            setSuccess(true);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message || "Registration failed. Please try again.");
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-sm text-center p-8 space-y-4">
                    <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-success/10 text-success">
                        <ShoppingBag className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold">Account created!</h2>
                    <p className="text-sm text-muted-foreground">Your seller account is ready. Sign in to set up your store.</p>
                    <Button asChild className="w-full">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <ShoppingBag className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Create Seller Account</h1>
                    <p className="text-sm text-muted-foreground">Start selling on our marketplace</p>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Your details</CardTitle>
                        <CardDescription>Fill in the form to create your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>First Name</Label>
                                    <Input placeholder="John" {...register("firstName")} />
                                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Last Name</Label>
                                    <Input placeholder="Doe" {...register("lastName")} />
                                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Username</Label>
                                <Input placeholder="johndoe" {...register("username")} />
                                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input type="email" placeholder="john@example.com" {...register("email")} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pr-10"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Confirm Password</Label>
                                <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
                                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" loading={isSubmitting}>
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
