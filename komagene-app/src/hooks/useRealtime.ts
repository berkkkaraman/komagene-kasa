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
                        const exists = records.find(r => r.id === newRecord.id);
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
    }, [userProfile?.branch_id, records, addRecord, updateRecord, deleteRecord]);
}
