"use client";

import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Yönetici Ayarları</h2>
                <p className="text-muted-foreground">Uygulama ve veri ayarlarını buradan yönetin.</p>
            </div>
            <SettingsView />
        </div>
    );
}

