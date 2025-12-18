import { DailyRecord, LegacyRow, ExpenseItem, DailyIncome } from '@/types';

const STORAGE_KEY = 'komagene_v2_data';
const LEGACY_KEY = 'komagene_ledger_data';

export const StorageService = {
    getRecords: (): DailyRecord[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Check for legacy data and migrate if V2 is empty
            const legacy = localStorage.getItem(LEGACY_KEY);
            if (legacy) {
                const legacyData: LegacyRow[] = JSON.parse(legacy);
                const migrated = legacyData.map(convertLegacyRow);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                return migrated;
            }
            return [];
        } catch (error) {
            console.error('Failed to load data', error);
            return [];
        }
    },

    saveRecords: (records: DailyRecord[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error('Failed to save data', error);
        }
    },

    addRecord: (record: DailyRecord) => {
        const records = StorageService.getRecords();
        records.push(record);
        StorageService.saveRecords(records);
    },

    updateRecord: (record: DailyRecord) => {
        const records = StorageService.getRecords();
        const index = records.findIndex((r) => r.id === record.id);
        if (index !== -1) {
            records[index] = record;
            StorageService.saveRecords(records);
        }
    },

    deleteRecord: (id: string) => {
        const records = StorageService.getRecords();
        const newRecords = records.filter((r) => r.id !== id);
        StorageService.saveRecords(newRecords);
    },

    exportData: () => {
        const records = StorageService.getRecords();
        const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `komagene_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData: (jsonString: string): boolean => {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error('Invalid format');
            // Basic validation could be improved
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    }
};

function convertLegacyRow(row: LegacyRow): DailyRecord {
    const expenses: ExpenseItem[] = [];

    if (row.expense.staff > 0) expenses.push({ id: generateId(), category: 'staff', amount: row.expense.staff });
    if (row.expense.rent > 0) expenses.push({ id: generateId(), category: 'rent', amount: row.expense.rent });
    if (row.expense.supplies > 0) expenses.push({ id: generateId(), category: 'supplies', amount: row.expense.supplies });
    if (row.expense.tax > 0) expenses.push({ id: generateId(), category: 'tax', amount: row.expense.tax });
    if (row.expense.other > 0) expenses.push({ id: generateId(), category: 'other', amount: row.expense.other });

    const income: DailyIncome = {
        cash: row.income.cash || 0,
        creditCard: row.income.pos || 0,
        mealCard: { sodexo: 0, multinet: 0, setcard: 0 },
        // Map legacy 'online' total to 'trendyol' as a placeholder, since we don't know the breakdown
        online: { yemeksepeti: 0, getir: 0, trendyol: row.income.online || 0, gelal: 0 }
    };

    return {
        id: row.id,
        date: row.date,
        income,
        expenses,
        note: row.note,
        isMarked: row.marked
    };
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
