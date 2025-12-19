import { supabase } from '@/lib/supabase';
import { DailyRecord } from '@/types';

export const LedgerService = {
    /**
     * Syncs locally stored records to Supabase.
     * Only syncs records that are marked as isSynced: false.
     */
    async syncToCloud(records: DailyRecord[]): Promise<{ success: boolean; syncedCount: number; error?: any }> {
        const unsyncedRecords = records.filter(r => !r.isSynced);

        if (unsyncedRecords.length === 0) {
            return { success: true, syncedCount: 0 };
        }

        try {
            // Phase 8: Default Branch ID (per requirement, placeholder for now)
            const DEFAULT_BRANCH = '00000000-0000-0000-0000-000000000000';

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
                        branch_id: DEFAULT_BRANCH,
                        is_marked: false,
                        is_closed: record.isClosed,
                    }, { onConflict: 'date, branch_id' });


                if (error) throw error;
                return { ...record, isSynced: true };
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
    async fetchFromCloud(): Promise<DailyRecord[]> {
        try {
            const DEFAULT_BRANCH = '00000000-0000-0000-0000-000000000000';
            const { data, error } = await supabase
                .from('records')
                .select('*')
                .eq('branch_id', DEFAULT_BRANCH)
                .order('date', { ascending: false });

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                date: row.date,
                income: row.income,
                expenses: row.expenses,
                ledgers: row.ledgers || [],
                inventory: row.inventory || [],
                shift: row.shift || { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                note: row.note,
                isSynced: true,
                isClosed: row.is_closed || false
            }));

        } catch (error) {

            console.error('Fetch failed:', error);
            return [];
        }
    }
};
