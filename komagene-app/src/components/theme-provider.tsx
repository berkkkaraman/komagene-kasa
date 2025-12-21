"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

// Auto Dark Mode Scheduler Component
function AutoDarkModeScheduler({ children }: { children: React.ReactNode }) {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted) return;

        const checkNightMode = () => {
            const hour = new Date().getHours();
            // GÜNKASA UPDATE: 19:00 (7 PM) ile 07:00 (7 AM) arası Karanlık Mod
            const isNightTime = hour >= 19 || hour < 7;

            // Only auto-switch if the user is explicitly using 'system' preference
            if (isNightTime && theme === 'system') {
                setTheme('dark');
            }
        };

        // Check on mount
        checkNightMode();

        // Check every minute
        const interval = setInterval(checkNightMode, 60000);
        return () => clearInterval(interval);
    }, [mounted, setTheme, theme]);

    return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <AutoDarkModeScheduler>
                {children}
            </AutoDarkModeScheduler>
        </NextThemesProvider>
    );
}
