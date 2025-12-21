"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";

export function SaaSDiagnostic() {
    const { userProfile, settings } = useStore();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });
    }, []);

    // Derived state for env check
    const url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : "";
    const envCheck = url ? `Yüklü (${url.substring(0, 8)}...)` : "YÜKLÜ DEĞİL ❌";

    // 1. Durum: Giriş Yapılmamışsa veya Profil Yoksa (HATA EKRANI)
    if (!settings.isLoggedIn || !userProfile) {
        return (
            <div className="w-full p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div className="space-y-2 flex-1">
                    <h4 className="font-semibold text-yellow-800">SaaS Bağlantısı Bekleniyor</h4>
                    <p className="text-sm text-yellow-700">
                        Sistem şu an yerel modda çalışıyor olabilir.
                    </p>

                    {/* DEBUG PANELİ (Sadece Hata Varsa Göster) */}
                    <div className="bg-black/80 text-green-400 p-3 rounded text-xs font-mono w-full mt-2">
                        <div className="font-bold border-b border-white/20 mb-1 pb-1">🔍 TEKNİK TANI (DEBUG)</div>
                        <div className="grid grid-cols-[100px_1fr] gap-1">
                            <span className="text-white/60">ENV URL:</span>
                            <span>{envCheck}</span>

                            <span className="text-white/60">Oturum:</span>
                            <span>{session ? "✅ Açık (" + session.user.email + ")" : "❌ Kapalı (Giriş Yapılmadı)"}</span>

                            <span className="text-white/60">Profil:</span>
                            <span>{userProfile ? "✅ Var" : "❌ Yok (Veri Çekilemedi)"}</span>

                            <span className="text-white/60">Store Login:</span>
                            <span>{settings.isLoggedIn ? "✅ True" : "❌ False"}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Durum: Sistem Çalışıyor (BAŞARILI)
    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Database className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium uppercase tracking-wider">Şube Bağlantısı</div>
                            <div className="font-bold text-green-900 flex items-center gap-2">
                                {userProfile.branch_id || "ATANMAMIŞ"}
                                <Badge variant="outline" className="bg-white text-green-700 border-green-200 h-5 text-[10px]">
                                    Online
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-green-200 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full">
                            <ShieldCheck className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium uppercase tracking-wider">Yetki Seviyesi</div>
                            <div className="font-bold text-green-900 uppercase">
                                {userProfile.role || "BELİRSİZ"}
                            </div>
                        </div>
                    </div>

                    <div className="ml-auto">
                        <CheckCircle2 className="h-6 w-6 text-green-600 opacity-20" />
                    </div>
                </div>

                {!userProfile.branch_id && (
                    <div className="p-3 bg-rose-100/50 text-rose-600 text-xs rounded-lg border border-rose-200">
                        ⚠️ DİKKAT: Kullanıcıya atanmış bir şube bulunamadı. Veri göremeyebilir veya ekleyemeyebilirsiniz.
                        Lütfen Supabase üzerinden &apos;profiles&apos; tablosunu kontrol edin.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
