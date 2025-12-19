"use client";

import { useNotifications } from "@/hooks/useNotifications";

// Component to initialize notifications and service worker
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    // This hook registers SW and checks for overdue ledgers
    useNotifications();

    return <>{children}</>;
}
