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
        <div className="min-h-screen bg-background selection:bg-primary selection:text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(215,25,32,0.02),transparent_70%)] pointer-events-none" />

            <Card className="w-full max-w-xl glass-panel border-white/10 shadow-2xl relative z-10 rounded-[3rem] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                {/* Header with Progress */}
                <CardHeader className="p-10 pb-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-glow-sm shadow-primary/10 border border-white/10">
                        <Building2 className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-display font-black tracking-tighter uppercase italic">
                        GÜN<span className="text-primary not-italic">KASA</span>
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", step === 1 ? "bg-primary w-12" : "bg-primary/20")} />
                        <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", step === 2 ? "bg-primary w-12" : "bg-primary/20")} />
                    </div>
                </CardHeader>

                <CardContent className="p-10 pt-4">
                    {step === 1 ? (
                        <form onSubmit={handleStep1} className="space-y-8 animate-in slide-in-from-left duration-500">
                            <div className="text-center mb-4">
                                <h4 className="text-xl font-display font-black tracking-tight uppercase">Hesap Oluştur</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Yönetici kimliğinizi belirleyin</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">E-Posta Adresi</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="isletme@komagene.com"
                                        className="h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium px-6"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Güçlü Bir Şifre</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium px-6"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-display font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all group overflow-hidden relative">
                                <span className="relative z-10">DEVAM ET</span>
                                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="pt-4 text-center">
                                <p className="text-xs font-bold text-muted-foreground">
                                    Zaten bir hesabınız var mı?{" "}
                                    <a href="/login" className="text-primary font-black hover:underline uppercase tracking-tighter">Giriş Yapın</a>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalSubmit} className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="text-center mb-4">
                                <h4 className="text-xl font-display font-black tracking-tight uppercase">İşletme Detayları</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Kurulumunuzu tamamlayalım</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">İşletme Tam Adı</Label>
                                    <Input
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Örn: Komagene Beşiktaş Şubesi"
                                        className="h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium px-6"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Sektörünüzü Seçin</Label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {SECTORS.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setSector(s.id)}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all duration-300 group overflow-hidden",
                                                    sector === s.id
                                                        ? "border-primary bg-primary/10 shadow-glow-sm shadow-primary/20"
                                                        : "border-white/5 glass-card hover:bg-white/5"
                                                )}
                                            >
                                                <s.icon className={cn("w-6 h-6 mb-2 transition-transform duration-500 group-hover:scale-110", sector === s.id ? "text-primary" : "text-muted-foreground/50")} />
                                                <span className={cn("text-[8px] font-black uppercase tracking-tighter", sector === s.id ? "text-primary" : "text-muted-foreground/40")}>{s.label.split(' ')[0]}</span>
                                                {sector === s.id && <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">İletişim Numarası (Opsiyonel)</Label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="05XX XXX XX XX"
                                        className="h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium px-6"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-16 rounded-[1.5rem] flex-1 font-display font-black text-xs uppercase tracking-widest glass-panel border-white/5 hover:bg-white/5">
                                    GERİ
                                </Button>
                                <Button type="submit" disabled={isLoading} className="h-16 rounded-[1.5rem] flex-[2] font-display font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-500 to-primary bg-[length:200%_100%] animate-gradient" />
                                    <div className="relative flex items-center justify-center gap-3">
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Building2 className="w-6 h-6" />}
                                        <span>{isLoading ? "KURULUYOR..." : "KAYIT OL"}</span>
                                    </div>
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <div className="px-10 pb-10 text-center">
                    <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                        &copy; 2024 SG-AI TEAM • PREMIUM BUSINESS SUITE
                    </p>
                </div>
            </Card>
        </div>
    );
}
