"use client";

import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard requiredRole="admin">
            <div className="min-h-screen bg-muted/40 pb-12">
                {/* Admin Header or Sidebar could act here, but for now we wrap content */}
                {children}
            </div>
        </AdminGuard>
    );
}
