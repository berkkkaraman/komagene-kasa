"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Branch } from '@/types';

interface BusinessState {
    currentBranch: Branch | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setBranch: (branch: Branch) => void;
    clearBranch: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

// Default branch for fallback/demo purposes
const DEFAULT_BRANCH: Branch = {
    id: 'demo',
    name: 'Demo İşletme',
    slug: 'demo',
    primary_color: '#D71920',
    tagline: 'Lezzet & Hız',
    sector: 'restaurant',
    ticker_message: 'GÜNKASA • Dijital POS & Menü Çözümü • Afiyet Olsun!',
    is_active: true,
    subscription_tier: 'free'
};

export const useBusinessStore = create<BusinessState>()(
    persist(
        (set) => ({
            currentBranch: null,
            isLoading: false,
            error: null,

            setBranch: (branch) => set({ currentBranch: branch, error: null }),

            clearBranch: () => set({ currentBranch: null }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),
        }),
        {
            name: 'gunkasa-business-storage',
            partialize: (state) => ({ currentBranch: state.currentBranch }),
        }
    )
);

// Helper hook to get business name (with fallback)
export const useBusinessName = () => {
    const branch = useBusinessStore((state) => state.currentBranch);
    return branch?.name || 'Günkasa';
};

// Helper hook to get ticker message
export const useTickerMessage = () => {
    const branch = useBusinessStore((state) => state.currentBranch);
    return branch?.ticker_message || DEFAULT_BRANCH.ticker_message;
};

// Helper hook to get primary color for dynamic theming
export const usePrimaryColor = () => {
    const branch = useBusinessStore((state) => state.currentBranch);
    return branch?.primary_color || DEFAULT_BRANCH.primary_color;
};

export { DEFAULT_BRANCH };
