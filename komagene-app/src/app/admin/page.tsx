"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /admin to /dashboard
export default function AdminRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/dashboard"); }, [router]);
    return null;
}
