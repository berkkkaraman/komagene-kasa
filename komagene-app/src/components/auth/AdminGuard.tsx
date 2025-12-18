"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // We use sessionStorage so it clears when the tab is closed
        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            router.push("/");
        }
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Güvenlik kontrolü yapılıyor...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
