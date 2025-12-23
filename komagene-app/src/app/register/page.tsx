"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Utensils, Coffee, ShoppingCart, ChefHat, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTORS = [
    { id: 'restaurant', label: 'Restoran', icon: Utensils, color: 'bg-orange-500' },
    { id: 'cafe', label: 'Kafe', icon: Coffee, color: 'bg-amber-600' },
    { id: 'market', label: 'Market', icon: ShoppingCart, color: 'bg-emerald-500' },
    { id: 'bakery', label: 'Fırın / Pastane', icon: ChefHat, color: 'bg-pink-500' },
    { id: 'other', label: 'Diğer', icon: Building2, color: 'bg-slate-500' },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [sector, setSector] = useState<string>("restaurant");
    const [phone, setPhone] = useState("");

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("E-posta ve şifre gerekli");
            return;
        }
        if (password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalı");
            return;
        }
        setStep(2);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessName) {
            toast.error("İşletme adı gerekli");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Kullanıcı oluşturulamadı");

            // 2. Create branch for this business
            const slug = businessName.toLowerCase()
                .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const { data: branchData, error: branchError } = await supabase
                .from('branches')
                .insert({
                    name: businessName,
                    slug: slug + '-' + Date.now().toString(36),
                    phone,
                    sector,
                    is_active: true,
                    subscription_tier: 'free'
                })
                .select()
                .single();

            if (branchError) throw branchError;

            // 3. Create profile linked to this branch
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email,
                    full_name: businessName + ' Admin',
                    role: 'admin',
                    branch_id: branchData.id
                });

            if (profileError) {
                console.error("Profile error:", profileError);
                // Profile might fail due to RLS, but auth succeeded
            }

            toast.success("Hesabınız oluşturuldu! 🎉", {
                description: "E-postanıza gönderilen bağlantıyla hesabınızı doğrulayın."
            });

            router.push("/login?registered=true");

        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error("Kayıt hatası: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-none shadow-2xl rounded-[2rem] overflow-hidden">
                {/* Header */}
                <CardHeader className="bg-primary text-white p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-2xl">
                            <Building2 className="w-10 h-10" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter">
                        GÜN<span className="not-italic">KASA</span>
                    </CardTitle>
                    <CardDescription className="text-white/80 text-xs uppercase tracking-widest font-bold mt-2">
                        {step === 1 ? "Hesap Oluştur" : "İşletme Bilgileri"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    {step === 1 ? (
                        <form onSubmit={handleStep1} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">E-posta</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="isletme@example.com"
                                    className="h-12 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Şifre</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2">
                                Devam Et <ArrowRight className="w-4 h-4" />
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Zaten hesabınız var mı?{" "}
                                <a href="/login" className="text-primary font-bold hover:underline">Giriş Yapın</a>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">İşletme Adı</Label>
                                <Input
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Örn: Lezzet Durağı"
                                    className="h-12 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sektör</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {SECTORS.map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setSector(s.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                                                sector === s.id
                                                    ? "border-primary bg-primary/10 scale-105"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <s.icon className={cn("w-6 h-6 mb-1", sector === s.id ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-[10px] font-bold uppercase">{s.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefon (Opsiyonel)</Label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0532 123 45 67"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1">
                                    Geri
                                </Button>
                                <Button type="submit" disabled={isLoading} className="h-12 rounded-xl flex-1 font-bold gap-2">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isLoading ? "Kaydediliyor..." : "İşletmemi Oluştur"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
