"use client";

import { useStore } from "@/store/useStore";
import { LedgerService } from "@/services/ledgerService";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

export function SyncButton() {
    const { records, setRecords } = useStore();
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const unsyncedCount = records.filter(r => !r.isSynced).length;

    const handleSync = async () => {
        if (!user) {
            toast.error("Eşitleme için giriş yapmalısınız.");
            return;
        }
        setIsSyncing(true);
        try {
            const { success, syncedCount, error } = await LedgerService.syncToCloud(records);
            if (success) {
                // Update local state to reflect sync
                const updatedRecords = records.map(r => ({ ...r, isSynced: true }));
                setRecords(updatedRecords);
                toast.success(`${syncedCount} kayıt buluta eşitlendi.`);
            } else {
                toast.error("Eşitleme başarısız: " + (error?.message || "Bilinmeyen hata"));
            }
        } catch (err) {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
                "gap-2 h-8",
                unsyncedCount > 0 ? "border-amber-500/50 text-amber-500" : "text-muted-foreground"
            )}
        >
            {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
            ) : unsyncedCount > 0 ? (
                <CloudOff className="h-4 w-4" />
            ) : (
                <Cloud className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {isSyncing ? "Eşitleniyor..." : unsyncedCount > 0 ? `${unsyncedCount} Bekliyor` : "Güncel"}
            </span>
        </Button>
    );
}
