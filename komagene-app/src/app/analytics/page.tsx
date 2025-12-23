"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ArchiveView } from "@/components/archive/ArchiveView";

export default function AnalyticsPage() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">Analizler İçin Giriş Yapın</h2>
                <Button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
                    Google ile Giriş Yap
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ArchiveView />
        </div>
    );
}
