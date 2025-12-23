"use client";

import { useStore } from "@/store/useStore";
import { useEffect } from "react";

export function BrightnessOverlay() {
    const { settings } = useStore();
    const { brightness } = settings;

    // Apply filter to the main HTML element for global effect
    useEffect(() => {
        const root = document.documentElement;
        // Clamp value between 50 and 100 just in case
        const val = Math.max(50, Math.min(100, brightness));
        root.style.filter = `brightness(${val}%)`;
        root.style.transition = "filter 0.3s ease";

        return () => {
            root.style.filter = '';
        };
    }, [brightness]);

    return null; // Invisible component
}
