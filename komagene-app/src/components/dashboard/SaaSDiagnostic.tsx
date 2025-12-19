"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Server, User, GitBranch } from "lucide-react";

export function SaaSDiagnostic() {
    const { userProfile, settings } = useStore();

    if (!settings.isLoggedIn) {
        return (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                <div>
                    <strong>SaaS Modülü Yüklenemedi</strong>
                    <p className="text-xs opacity-90">Veritabanı kurulumu yapılmamış veya oturum açılmamış. Lütfen 'supabase_schema.sql' dosyasını çalıştırdığınızdan emin olun.</p>
                </div>
            </div>
        );
    }

    return (
        <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-indigo-500">
                    <ShieldCheck className="h-5 w-5" />
                    SaaS Sistem Kontrolü
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Kullanıcı Rolü</span>
                    </div>
                    <Badge variant={userProfile?.role === 'admin' ? "default" : "secondary"}>
                        {userProfile?.role?.toUpperCase() || "TANIMSIZ"}
                    </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="flex items-center gap-3">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Aktif Şube ID</span>
                    </div>
                    <code className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
                        {userProfile?.branch_id || "ŞUBE ATANMAMIŞ"}
                    </code>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Veri İzolasyonu</span>
                    </div>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                        AKTİF (RLS)
                    </Badge>
                </div>

                {!userProfile?.branch_id && (
                    <div className="p-3 bg-rose-100/50 dark:bg-rose-900/20 text-rose-600 text-xs rounded-lg border border-rose-200 dark:border-rose-900">
                        ⚠️ DİKKAT: Kullanıcıya atanmış bir şube bulunamadı. Veri göremeyebilir veya ekleyemeyebilirsiniz. Lütfen Supabase üzerinden 'profiles' tablosunu kontrol edin.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
