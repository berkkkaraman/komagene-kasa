import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { DailyRecord, LedgerItem } from '@/types';
import { toast } from 'sonner';

export function useRealtimeSubscription() {
    const {
        userProfile,
        records, setRecords,
        addRecord, updateRecord, deleteRecord,
        addLedger, removeLedger
    } = useStore();

    useEffect(() => {
        if (!userProfile?.branch_id) return;

        console.log("🔌 Realtime bağlantısı kuruluyor...", userProfile.branch_id);

        // 1. Initial Fetch (Verileri Çek)
        const loadInitialData = async () => {
            try {
                // Import dynamically to avoid circular dependencies if any, or just standard import
                const { LedgerService } = await import('@/services/ledgerService');
                const cloudRecords = await LedgerService.fetchFromCloud(userProfile.branch_id);

                if (cloudRecords.length > 0) {
                    // Smart Merge: Keep local unsynced stuff, replace synced stuff with cloud version
                    const currentRecords = useStore.getState().records;
                    const unsyncedLocal = currentRecords.filter(r => !r.isSynced);

                    // Filter out cloud records that might conflict with unsynced local (by ID)
                    // (Ensure we prefer local version if it's being edited? Or prefer cloud? 
                    // Usually local unsynced is fresher).
                    const mergedRecords = [
                        ...cloudRecords.filter(cr => !unsyncedLocal.find(ur => ur.id === cr.id)),
                        ...unsyncedLocal
                    ];

                    // Sort by date desc
                    mergedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    setRecords(mergedRecords);
                    // toast.success("Veriler güncellendi"); // Optional: Don't spam on load
                }
            } catch (e) {
                console.error("Initial load failed:", e);
            }
        };

        loadInitialData();

        // 2. Realtime Subscription (Canlı Dinle)
        const channel = supabase
            .channel(`branch_sync_${userProfile.branch_id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'records',
                    filter: `branch_id=eq.${userProfile.branch_id}`
                },
                (payload) => {
                    console.log('🔄 Record Değişikliği:', payload);
                    const newRecord = payload.new as DailyRecord;
                    const oldRecord = payload.old as { id: string };

                    if (payload.eventType === 'INSERT') {
                        // Optimistic UI might already have it?
                        // If not found in store, add it.
                        // We check ID to prevent duplicates if valid
                        const exists = useStore.getState().records.find(r => r.id === newRecord.id);
                        if (!exists) {
                            addRecord(newRecord);
                            toast.info("Yeni kayıt eklendi");
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        updateRecord(newRecord);
                    } else if (payload.eventType === 'DELETE') {
                        deleteRecord(oldRecord.id);
                        toast.warning("Bir kayıt silindi");
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("✅ Canlı bağlantı aktif!");
                }
            });

        return () => {
            console.log("🔌 Bağlantı kesiliyor...");
            supabase.removeChannel(channel);
        };
    }, [userProfile?.branch_id, setRecords, addRecord, updateRecord, deleteRecord]);
}
