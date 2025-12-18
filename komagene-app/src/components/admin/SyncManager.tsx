"use client";

import { useState } from "react";
import { StorageService } from "@/services/storage";
import { SupabaseService } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CloudUpload, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SyncManager() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        const records = StorageService.getRecords();
        const ledger = StorageService.getLedger();

        const total = records.length + ledger.length;
        let count = 0;
        setProgress({ current: 0, total });

        try {
            // Sync Records
            for (const record of records) {
                const response = await SupabaseService.saveRecord(record);
                if (response.error) throw response.error;
                count++;
                setProgress({ current: count, total });
            }

            // Sync Ledger
            for (const item of ledger) {
                const response = await SupabaseService.saveLedgerItem(item);
                if (response.error) throw response.error;
                count++;
                setProgress({ current: count, total });
            }

            toast.success("Tüm veriler buluta başarıyla taşındı!");
        } catch (error: any) {
            console.error("Sync failed details:", JSON.stringify(error, null, 2));
            toast.error(`Hata: ${error.message || error.details || "Bilinmeyen bir hata oluştu"}`);
        } finally {
            setIsSyncing(false);
            setProgress(null);
        }
    };

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CloudUpload className="h-5 w-5 text-primary" /> Bulut Senkronizasyonu
                </CardTitle>
                <CardDescription>
                    Cihazınızdaki verileri güvenli bir şekilde sunucuya taşıyın.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-sm text-amber-800">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold">Önemli Not</p>
                        <p>Senkronizasyon işleminden önce .env.local dosyanızın doğru yapılandırıldığından emin olun.</p>
                    </div>
                </div>

                {isSyncing ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Veriler aktarılıyor...
                            </span>
                            <span className="font-bold">{progress?.current} / {progress?.total}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(progress!.current / progress!.total) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={handleSync}
                        className="w-full h-12 text-lg font-bold gap-2 shadow-lg"
                    >
                        <RefreshCw className="h-5 w-5" /> Buluta Aktarımı Başlat
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
