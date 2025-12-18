"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Salad } from "lucide-react";

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
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />

            <Card className="w-full max-w-md glass-card border-none shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-1">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Salad className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight">KOMAGENE</CardTitle>
                    <CardDescription className="font-bold text-foreground/60 uppercase tracking-widest text-xs">
                        Merkezi Yönetim Sistemi
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="E-posta"
                                    className="pl-10 h-12 rounded-xl bg-white/50 dark:bg-accent/20 border-border/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Şifre"
                                    className="pl-10 h-12 rounded-xl bg-white/50 dark:bg-accent/20 border-border/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4 flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Giriş Yap"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-tighter">
                            Ticari Kullanım Koşulları Geçerlidir &copy; 2024
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
