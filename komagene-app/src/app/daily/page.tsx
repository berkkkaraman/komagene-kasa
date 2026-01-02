"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /daily to /dashboard
export default function DailyRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/dashboard"); }, [router]);
    return null;
}
