import { supabase } from '@/lib/supabase';
import { DailyRecord } from '@/types';

export const LedgerService = {
    /**
     * Syncs locally stored records to Supabase.
     * Only syncs records that are marked as isSynced: false.
     */
    async syncToCloud(records: DailyRecord[], branchId: string): Promise<{ success: boolean; syncedCount: number; error?: any }> {
        const unsyncedRecords = records.filter(r => !r.isSynced);

        if (unsyncedRecords.length === 0) {
            return { success: true, syncedCount: 0 };
        }

        if (!branchId) {
            return { success: false, syncedCount: 0, error: { message: "Şube kimliği eksik." } };
        }

        try {
            const syncTasks = unsyncedRecords.map(async (record) => {
                const { error } = await supabase
                    .from('records')
                    .upsert({
                        id: record.id,
                        date: record.date,
                        income: record.income,
                        expenses: record.expenses,
                        ledgers: record.ledgers,
                        inventory: record.inventory,
                        shift: record.shift,
                        note: record.note,
                        branch_id: branchId,
                        is_marked: false,
                        is_closed: record.isClosed,
                    }, { onConflict: 'date, branch_id' }); // Conflict strategy updated


                if (error) throw error;
                return { ...record, isSynced: true, branch_id: branchId };
            });

            const updatedRecords = await Promise.all(syncTasks);

            return {
                success: true,
                syncedCount: updatedRecords.length
            };
        } catch (error) {
            console.error('Sync failed:', error);
            return { success: false, syncedCount: 0, error };
        }
    },

    /**
     * Fetches records from Supabase and merges them.
     */
    async fetchFromCloud(branchId: string): Promise<DailyRecord[]> {
        if (!branchId) {
            console.warn("⚠️ fetchFromCloud: Şube ID eksik, veri çekilmedi.");
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('records')
                .select('*')
                .eq('branch_id', branchId)
                .order('date', { ascending: false });

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                date: row.date,
                income: row.income || { cash: 0, creditCard: 0, online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 }, source: 'manual' },
                expenses: row.expenses || [],
                ledgers: row.ledgers || [],
                inventory: row.inventory || [],
                shift: row.shift || { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                note: row.note || '',
                isSynced: true,
                isClosed: row.is_closed || false,
                branch_id: row.branch_id
            }));

        } catch (error) {
            console.error('❌ Veri Çekme Hatası (Cloud):', error);
            return [];
        }
    }
};
