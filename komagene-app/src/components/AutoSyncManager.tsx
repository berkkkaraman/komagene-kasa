"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { LedgerService } from "@/services/ledgerService";
import { toast } from "sonner";
import { Cloud, CheckCircle2 } from "lucide-react";

export function AutoSyncManager() {
    const { records, setRecords, userProfile } = useStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = useRef(false);

    // Filter unsynced records
    const unsyncedCount = records.filter(r => !r.isSynced).length;

    useEffect(() => {
        // Condition 1: Must have unsynced records
        if (unsyncedCount === 0) return;

        // Condition 2: Must be logged in with a branch
        if (!userProfile?.branch_id) return;

        // Debounce Logic: Wait 5 seconds after last change before syncing
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;

            try {
                // Show subtle loading state? Maybe not needed for background sync, 
                // but good for UX transparency.
                // toast.loading("Veriler buluta yedekleniyor...", { id: "autosync" });

                const { success, syncedCount, error } = await LedgerService.syncToCloud(records, userProfile.branch_id);

                if (success && syncedCount > 0) {
                    const updatedRecords = useStore.getState().records.map(r =>
                        !r.isSynced ? { ...r, isSynced: true, branch_id: userProfile.branch_id } : r
                    );
                    setRecords(updatedRecords);

                    // Subtle success toast
                    toast.success("Veriler otomatik yedeklendi", {
                        icon: <Cloud className="h-4 w-4 text-blue-500" />,
                        id: "autosync"
                    });
                } else if (error) {
                    // Only alert on error
                    console.error("AutoSync Error:", error);
                }
            } catch (e) {
                console.error("AutoSync Exception:", e);
            } finally {
                isSyncingRef.current = false;
            }
        }, 5000); // 5 Seconds Debounce

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [unsyncedCount, userProfile?.branch_id, records, setRecords]);

    return null; // This component is logical only, no UI (toasts handle UI)
}
