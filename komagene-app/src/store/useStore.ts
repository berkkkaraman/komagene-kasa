import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, DailyRecord, AppSettings, LedgerItem, UserProfile } from '@/types';

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            records: [],
            globalLedgers: [],
            settings: {
                theme: 'system',
                isLoggedIn: false,
                brightness: 100,
            },
            isLoading: false,
            userProfile: null,

            setBrightness: (brightness: number) =>
                set((state) => ({
                    settings: { ...state.settings, brightness },
                })),

            addRecord: (record) =>
                set((state) => ({
                    records: [...state.records, {
                        ...record,
                        isSynced: false,
                        branch_id: state.userProfile?.branch_id // Auto-assign branch_id
                    }]
                })),

            updateRecord: (updatedRecord) =>
                set((state) => ({
                    records: state.records.map((r) =>
                        r.id === updatedRecord.id
                            ? { ...updatedRecord, isSynced: false, branch_id: state.userProfile?.branch_id || r.branch_id }
                            : r
                    ),
                })),

            deleteRecord: (id) =>
                set((state) => ({
                    records: state.records.filter((r) => r.id !== id),
                })),

            setRecords: (records) => set({ records }),

            setTheme: (theme) =>
                set((state) => ({
                    settings: { ...state.settings, theme },
                })),

            setBrightness: (brightness) =>
                set((state) => ({
                    settings: { ...state.settings, brightness },
                })),

            login: () =>
                set((state) => ({
                    settings: { ...state.settings, isLoggedIn: true },
                })),

            logout: () =>
                set((state) => ({
                    settings: { ...state.settings, isLoggedIn: false },
                    userProfile: null, // Clear profile on logout
                    records: [],       // Clear records on logout (security)
                    globalLedgers: []
                })),

            setUserProfile: (profile) =>
                set({ userProfile: profile }),

            // Veresiye işlemleri
            addLedger: (ledger) =>
                set((state) => ({
                    globalLedgers: [...state.globalLedgers, {
                        ...ledger,
                        branch_id: state.userProfile?.branch_id // Auto-assign branch_id
                    }]
                })),

            removeLedger: (id) =>
                set((state) => ({
                    globalLedgers: state.globalLedgers.filter((l) => l.id !== id)
                })),

            payLedger: (ledgerId, targetDate) => {
                const state = get();
                const ledger = state.globalLedgers.find(l => l.id === ledgerId);
                if (!ledger) return;

                // Find or create the target date's record
                const targetRecord = state.records.find(r => r.date === targetDate);

                if (targetRecord) {
                    // Add ledger amount to cash income
                    const updatedRecord: DailyRecord = {
                        ...targetRecord,
                        income: {
                            ...targetRecord.income,
                            cash: (targetRecord.income.cash || 0) + ledger.amount
                        },
                        isSynced: false
                    };

                    set({
                        records: state.records.map(r => r.id === targetRecord!.id ? updatedRecord : r),
                        globalLedgers: state.globalLedgers.filter(l => l.id !== ledgerId)
                    });
                } else {
                    // Create new record for today with ledger amount as cash
                    const newRecord: DailyRecord = {
                        id: crypto.randomUUID(),
                        date: targetDate,
                        income: {
                            cash: ledger.amount,
                            creditCard: 0,
                            online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 },
                            source: 'manual'
                        },
                        expenses: [],
                        ledgers: [],
                        inventory: [],
                        shift: { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                        note: '',
                        isSynced: false,
                        isClosed: false,
                        branch_id: state.userProfile?.branch_id // Auto-assign branch_id
                    };

                    set({
                        records: [...state.records, newRecord],
                        globalLedgers: state.globalLedgers.filter(l => l.id !== ledgerId)
                    });
                }
            },
        }),
        {
            name: 'gunkasa-storage',
        }
    )
);
