"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Database, ShieldCheck, Wifi } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SaaSDiagnostic() {
    const { userProfile, settings } = useStore();
    const [session, setSession] = useState<any>(null);
    const [envCheck, setEnvCheck] = useState<string>("Bilinmiyor");

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        // Check if env var is loaded (client side)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        setEnvCheck(url ? `Yüklü (${url.substring(0, 8)}...)` : "YÜKLÜ DEĞİL ❌");
    }, []);

    // 1. Durum: Giriş Yapılmamışsa veya Profil Yoksa (HATA EKRANI)
    if (!settings.isLoggedIn || !userProfile) {
        return (
            <div className="w-full p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
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
        {!userProfile?.branch_id && (
            <div className="p-3 bg-rose-100/50 dark:bg-rose-900/20 text-rose-600 text-xs rounded-lg border border-rose-200 dark:border-rose-900">
                ⚠️ DİKKAT: Kullanıcıya atanmış bir şube bulunamadı. Veri göremeyebilir veya ekleyemeyebilirsiniz. Lütfen Supabase üzerinden 'profiles' tablosunu kontrol edin.
            </div>
        )
}
            </CardContent >
        </Card >
    );
}
