import { supabase } from '@/lib/supabase';
import { DailyRecord, LedgerItem } from '@/types';

const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

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
        const sanitizedId = isUUID(record.id) ? record.id : crypto.randomUUID();
        const { error } = await supabase
            .from('records')
            .upsert({
                id: sanitizedId,
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
        const sanitizedId = isUUID(item.id) ? item.id : crypto.randomUUID();
        const { error } = await supabase
            .from('ledger')
            .upsert({
                id: sanitizedId,
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
