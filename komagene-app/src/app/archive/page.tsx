"use client";

import { ArchiveView } from "@/components/archive/ArchiveView";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function ArchivePage() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">Arşiv İçin Giriş Yapın</h2>
                <Button
                    onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                >
                    Google ile Giriş Yap
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Arşiv ve Raporlar</h2>
                <p className="text-muted-foreground">Geçmiş verileri inceleyin ve analiz edin.</p>
            </div>
            <ArchiveView />
        </div>
    );
}
