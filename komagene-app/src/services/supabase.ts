import { supabase } from '@/lib/supabase';
import { DailyRecord, LedgerItem } from '@/types';

export const SupabaseService = {
    // Daily Records
    getRecords: async (): Promise<DailyRecord[]> => {
        const { data, error } = await supabase
            .from('records')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching records:', error);
            return [];
        }

        // Map database fields to frontend types if necessary (snake_case to camelCase)
        return data.map(row => ({
            id: row.id,
            date: row.date,
            income: row.income,
            expenses: row.expenses,
            note: row.note,
            isMarked: row.is_marked,
            zReportImage: row.z_report_image,
            cashCount: row.cash_count,
            reconciliationDiff: row.reconciliation_diff,
            inventory: row.inventory,
            shiftReport: row.shift_report
        }));
    },

    saveRecord: async (record: DailyRecord) => {
        const { error } = await supabase
            .from('records')
            .upsert({
                id: record.id,
                date: record.date,
                income: record.income,
                expenses: record.expenses,
                note: record.note,
                is_marked: record.isMarked,
                z_report_image: record.zReportImage,
                cash_count: record.cashCount,
                reconciliation_diff: record.reconciliationDiff,
                inventory: record.inventory,
                shift_report: record.shiftReport
            }, { onConflict: 'date' });

        return { error };
    },

    // Ledger (Veresiye)
    getLedger: async (): Promise<LedgerItem[]> => {
        const { data, error } = await supabase
            .from('ledger')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching ledger:', error);
            return [];
        }

        return data.map(row => ({
            id: row.id,
            customerName: row.customer_name,
            amount: row.amount,
            date: row.date,
            isPaid: row.is_paid,
            paidAt: row.paid_at
        }));
    },

    saveLedgerItem: async (item: LedgerItem) => {
        const { error } = await supabase
            .from('ledger')
            .upsert({
                id: item.id,
                customer_name: item.customerName,
                amount: item.amount,
                date: item.date,
                is_paid: item.isPaid,
                paid_at: item.paidAt
            });

        return { error };
    },

    deleteLedgerItem: async (id: string) => {
        const { error } = await supabase
            .from('ledger')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
