// Gelir Detayları
export interface IncomeData {
    cash: number;       // Nakit Ciro
    creditCard: number; // Banka POS
    online: {           // Online Platform Detayları
        yemeksepeti: number;
        getir: number;
        trendyol: number;
        gelal: number;
    };
}

// Gider Kalemi
export interface ExpenseItem {
    id: string;
    amount: number;
    category: 'supplier' | 'staff' | 'bills' | 'tax' | 'other';
    description: string;
}

// Veresiye Kalemi
export interface LedgerItem {
    id: string;
    customer: string;
    amount: number;
    description: string;
    isPaid: boolean;
    createdDate: string;  // Oluşturulma tarihi
    dueDate?: string;     // Son ödeme tarihi (opsiyonel)
}

// Vardiya Teslim
export interface ShiftData {
    cashOnStart: number;
    cashOnEnd: number;
    difference: number;
    closedBy?: string;    // Günü kapatan personel adı
}

// Envanter Kalemi
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

// Günlük Kayıt (Ana Yapı)
export interface DailyRecord {
    id: string;
    date: string;
    income: IncomeData;
    expenses: ExpenseItem[];
    ledgers: LedgerItem[];
    inventory: InventoryItem[];
    shift: ShiftData;
    note: string;
    isSynced: boolean;
    isClosed: boolean; // Gün kapatıldı mı?
}

// State Management için ek tipler
export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    isLoggedIn: boolean;
}

export interface AppState {
    records: DailyRecord[];
    globalLedgers: LedgerItem[];  // Global veresiye listesi
    settings: AppSettings;
    isLoading: boolean;
    addRecord: (record: DailyRecord) => void;
    updateRecord: (record: DailyRecord) => void;
    deleteRecord: (id: string) => void;
    setRecords: (records: DailyRecord[]) => void;
    setTheme: (theme: AppSettings['theme']) => void;
    login: () => void;
    logout: () => void;
    // Veresiye işlemleri
    addLedger: (ledger: LedgerItem) => void;
    removeLedger: (id: string) => void;
    payLedger: (ledgerId: string, targetDate: string) => void;
}
