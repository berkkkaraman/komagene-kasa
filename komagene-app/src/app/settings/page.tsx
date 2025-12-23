"use client";

import { SettingsView } from "@/components/settings/SettingsView";
export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Yönetici <span className="text-primary not-italic">Ayarları</span></h2>
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest opacity-70">Uygulama kontrol merkezi ve yapılandırma</p>
            </div>

            <SettingsView />
        </div>
    );
}
