"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Salad, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error("Giriş başarısız: " + error.message);
            setLoading(false);
        } else {
            toast.success("Başarıyla giriş yapıldı!");
            router.push("/admin");
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(215,25,32,0.03),transparent_70%)] pointer-events-none" />

            <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl relative z-10 rounded-[3rem] overflow-hidden animate-in zoom-in-95 duration-700">
                <CardHeader className="text-center space-y-3 pt-12 pb-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-glow-sm shadow-primary/10 border border-white/10">
                        <Salad className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-5xl font-display font-black tracking-tighter uppercase italic">
                        GÜN<span className="text-primary not-italic">KASA</span>
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-8 bg-primary/20" />
                        <CardDescription className="font-display font-bold text-muted-foreground uppercase tracking-[0.3em] text-[9px]">
                            PROFESYONEL YÖNETİM
                        </CardDescription>
                        <div className="h-px w-8 bg-primary/20" />
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6 px-10">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">E-Posta Adresi</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="ornek@komagene.com"
                                    className="pl-12 h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Şifre</Label>
                                <a href="#" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Şifremi Unuttum</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-16 rounded-[1.5rem] glass-panel border-white/5 focus-visible:ring-primary/20 font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="px-10 pb-12 pt-10 flex flex-col gap-8">
                        <Button
                            type="submit"
                            className="w-full h-16 text-lg font-display font-black rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all gap-3 group relative overflow-hidden"
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-500 to-primary bg-[length:200%_100%] animate-gradient" />
                            <div className="relative flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
                                <span>{loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}</span>
                            </div>
                        </Button>
                        <div className="space-y-6 text-center">
                            <p className="text-xs font-bold text-muted-foreground">
                                Henüz bir hesabınız yok mu?{" "}
                                <a href="/register" className="text-primary font-black hover:underline uppercase tracking-tighter">Hemen Başlayın</a>
                            </p>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]">
                                &copy; 2024 SG-AI TEAM
                            </p>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
