"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { useRealtimeSubscription } from "@/hooks/useRealtime";

// ... existing AdminGuard code ...

/**
 * We can create a separate "RealtimeGuard" or just put it in the Layout.
 * But since we want it global for authenticated users, let's create a dedicated component
 * that we can mount in the root layout or AuthProvider.
 */
export function RealtimeManager() {
    useRealtimeSubscription();
    return null; // Headless component
}
