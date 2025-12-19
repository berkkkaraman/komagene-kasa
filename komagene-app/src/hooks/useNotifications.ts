"use client";

import { useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { differenceInDays, parseISO, isValid } from "date-fns";

// Hook to register Service Worker and check for overdue ledgers
export function useNotifications() {
    const { globalLedgers } = useStore();

    // Register Service Worker
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration.scope);
                })
                .catch((error) => {
                    console.error('SW registration failed:', error);
                });
        }
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }, []);

    // Check for overdue ledgers and show notification
    const checkOverdueLedgers = useCallback(async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        const today = new Date();
        const overdueLedgers = globalLedgers.filter(l => {
            if (l.isPaid || !l.dueDate) return false;
            const dueDate = parseISO(l.dueDate);
            if (!isValid(dueDate)) return false;
            return differenceInDays(dueDate, today) < 0;
        });

        if (overdueLedgers.length > 0) {
            const totalOverdue = overdueLedgers.reduce((sum, l) => sum + l.amount, 0);
            const formatCurrency = (val: number) =>
                new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

            new Notification('⚠️ Vadesi Geçen Veresiyeler!', {
                body: `${overdueLedgers.length} adet veresiyenin vadesi geçti. Toplam: ${formatCurrency(totalOverdue)}`,
                icon: '/icon.svg',
                tag: 'overdue-ledgers',
                requireInteraction: true
            });
        }
    }, [globalLedgers, requestPermission]);

    // Run check on mount and when ledgers change
    useEffect(() => {
        // Delay check to avoid showing on first load
        const timer = setTimeout(() => {
            checkOverdueLedgers();
        }, 5000);

        return () => clearTimeout(timer);
    }, [checkOverdueLedgers]);

    return { requestPermission, checkOverdueLedgers };
}
