export type ExpenseCategory = 'staff' | 'rent' | 'supplies' | 'tax' | 'other';

export interface MealCardBreakdown {
    sodexo: number;
    multinet: number;
    setcard: number;
}

export interface OnlineBreakdown {
    yemeksepeti: number;
    getir: number;
    trendyol: number;
    gelal: number;
}

export interface DailyIncome {
    cash: number;
    creditCard: number;
    mealCard: MealCardBreakdown;
    online: OnlineBreakdown;
}

export interface ExpenseItem {
    id: string;
    amount: number;
    category: ExpenseCategory;
    tag?: string;
    note?: string;
}

export interface DailyRecord {
    id: string; // Unique ID (usually timestamp-based or UUID)
    date: string; // YYYY-MM-DD
    income: DailyIncome;
    expenses: ExpenseItem[];
    note?: string;
    isMarked?: boolean;
    // Phase 2: Advanced Features
    zReportImage?: string; // Base64 string
    cashCount?: number; // Physical cash counted by staff
    reconciliationDiff?: number; // Difference (Count - System)
    inventory?: InventoryItem[]; // Stock status
    shiftReport?: ShiftReport; // Closing checklist and notes
    branch_id?: string; // Phase 8: SaaS Multi-tenancy
}

export type InventoryStatus = 'ok' | 'low' | 'out';

export interface InventoryItem {
    id: string;
    name: string;
    status: InventoryStatus;
}

export interface ShiftReport {
    completedAt: string;
    staffName?: string;
    checklist: {
        id: string;
        label: string;
        completed: boolean;
    }[];
    closingNote?: string;
}

export interface LedgerItem {
    id: string;
    customerName: string;
    amount: number;
    date: string;
    isPaid: boolean;
    paidAt?: string;
    branch_id?: string; // Phase 8: SaaS Multi-tenancy
}

// Legacy Type for Migration
export interface LegacyRow {
    id: string;
    date: string;
    income: {
        pos: number;
        cash: number;
        online: number;
    };
    expense: {
        staff: number;
        rent: number;
        supplies: number;
        tax: number;
        other: number;
    };
    note: string;
    marked: boolean;
}
