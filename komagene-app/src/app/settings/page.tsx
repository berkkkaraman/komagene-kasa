"use client";

import { SettingsView } from "@/components/settings/SettingsView";
import { CashCounter } from "@/components/dashboard/CashCounter";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Yönetici Ayarları</h2>
                <p className="text-muted-foreground">Uygulama ve veri ayarlarını buradan yönetin.</p>
            </div>

            {/* Cash Counter Tool */}
            <CashCounter />

            <SettingsView />
        </div>
    );
}
