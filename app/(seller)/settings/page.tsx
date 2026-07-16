"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "@/lib/api";

const profileSchema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
    const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

    const onProfileSubmit = async (data: ProfileData) => {
        setProfileError(null);
        try {
            await api.put("/api/v1/users/me", data);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setProfileError(msg || "Failed to update profile.");
        }
    };

    const onPasswordSubmit = async (data: PasswordData) => {
        setPasswordError(null);
        try {
            await api.put("/api/v1/users/me/password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            passwordForm.reset();
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setPasswordError(msg || "Failed to change password.");
        }
    };

    return (
        <Shell title="Settings">
            <div className="max-w-2xl">
                <Tabs defaultValue="profile">
                    <TabsList className="mb-6">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                            {profileSuccess && <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Profile updated.</div>}
                            {profileError && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{profileError}</div>}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Personal Information</CardTitle>
                                    <CardDescription>Update your name and contact details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>First Name</Label>
                                            <Input {...profileForm.register("firstName")} />
                                            {profileForm.formState.errors.firstName && <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Last Name</Label>
                                            <Input {...profileForm.register("lastName")} />
                                            {profileForm.formState.errors.lastName && <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Email</Label>
                                        <Input type="email" {...profileForm.register("email")} />
                                        {profileForm.formState.errors.email && <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end">
                                <Button type="submit" loading={profileForm.formState.isSubmitting}>Save Changes</Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password">
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                            {passwordSuccess && <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Password changed successfully.</div>}
                            {passwordError && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{passwordError}</div>}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Change Password</CardTitle>
                                    <CardDescription>Keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label>Current Password</Label>
                                        <Input type="password" {...passwordForm.register("currentPassword")} />
                                        {passwordForm.formState.errors.currentPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                                    </div>
                                    <Separator />
                                    <div className="space-y-1.5">
                                        <Label>New Password</Label>
                                        <Input type="password" {...passwordForm.register("newPassword")} />
                                        {passwordForm.formState.errors.newPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Confirm New Password</Label>
                                        <Input type="password" {...passwordForm.register("confirmPassword")} />
                                        {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end">
                                <Button type="submit" loading={passwordForm.formState.isSubmitting}>Update Password</Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notification Preferences</CardTitle>
                                <CardDescription>Choose which notifications you receive</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: "New Orders", desc: "Get notified when you receive a new order" },
                                    { label: "Low Stock Alerts", desc: "Get warned when products run low" },
                                    { label: "Review Notifications", desc: "Get notified about new customer reviews" },
                                    { label: "Store Status Updates", desc: "Updates about your store approval or suspension" },
                                    { label: "Payment Confirmations", desc: "Confirmation when payments are processed" },
                                ].map(({ label, desc }) => (
                                    <div key={label} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Shell>
    );
}
