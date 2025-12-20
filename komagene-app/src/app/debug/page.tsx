"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, RefreshCw, Database, Wifi, Smartphone, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DebugPage() {
    const { records, settings, userProfile } = useStore();
    const { user } = useAuth();
    const [cloudRecords, setCloudRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [swStatus, setSwStatus] = useState("Bilinmiyor");
    const [localStorageSize, setLocalStorageSize] = useState("0 KB");

    // 1. Initial Probe
    useEffect(() => {
        checkServiceWorker();
        calculateStorage();
        if (userProfile?.branch_id) {
            fetchCloudData(userProfile.branch_id);
        }
    }, [userProfile?.branch_id]);

    const checkServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            setSwStatus(regs.length > 0 ? `Aktif (${regs.length} adet)` : "Pasif");
        } else {
            setSwStatus("Desteklenmiyor");
        }
    };

    const calculateStorage = () => {
        let total = 0;
        for (let x in localStorage) {
            let amount = (localStorage[x].length * 2) / 1024;
            total += amount;
        }
        setLocalStorageSize(total.toFixed(2) + " KB");
    };

    const fetchCloudData = async (branchId: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('records')
                .select('id, date, income, created_at')
                .eq('branch_id', branchId)
                .order('date', { ascending: false })
                .limit(5);

            if (error) throw error;
            setCloudRecords(data || []);
        } catch (e: any) {
            toast.error("Bulut verisi çekilemedi: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Actions
    const handleForceReset = async () => {
        if (!confirm("DİKKAT: Tüm uygulama verileri ve önbellek silinecek. Giriş yapmanız gerekecek. Onaylıyor musunuz?")) return;

        try {
            // A. Clear Storage
            localStorage.clear();
            sessionStorage.clear();

            // B. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // C. Clear Caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }

            toast.success("Uygulama sıfırlandı. Sayfa yenileniyor...");
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (e) {
            toast.error("Sıfırlama hatası!");
        }
    };

    const handleManualPull = async () => {
        if (!userProfile?.branch_id) return;
        toast.info("Buluttan zorla çekiliyor...");
        await fetchCloudData(userProfile.branch_id);
    };

    return (
        <div className="container mx-auto p-4 space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Sistem Tanı Merkezi (Debug)
            </h1>
            <p className="text-muted-foreground">
                Bu sayfa, "görünmeyen" sorunları tespit etmek için geliştirici araçları sunar.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Local Device Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-blue-500" />
                            Cihaz Durumu
                        </CardTitle>
                        <CardDescription>Tarayıcı ve Yerel Kayıtlar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span>Service Worker:</span>
                            <span className="font-mono font-bold text-green-600">{swStatus}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Depolama (Local):</span>
                            <span className="font-mono">{localStorageSize}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Yerel Kayıt Sayısı:</span>
                            <span className="font-mono">{records.length} adet</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Eşitlenmemiş Kayıt:</span>
                            <span className="font-mono text-amber-500">
                                {records.filter(r => !r.isSynced).length} adet
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Cloud Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-purple-500" />
                            Bulut Durumu (Supabase)
                        </CardTitle>
                        <CardDescription>Sunucudaki Gerçek Veriler</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span>Bağlantı Kimliği (ID):</span>
                            <span className="font-mono text-xs overflow-hidden text-ellipsis w-24">
                                {user ? user.id : "Giriş Yok"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Şube ID:</span>
                            <span className="font-mono text-xs overflow-hidden text-ellipsis w-24">
                                {userProfile?.branch_id || "Yok"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span>Son 5 Kayıt (Bulut):</span>
                            <Button size="icon" variant="ghost" onClick={handleManualPull} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs font-mono h-32 overflow-y-auto">
                            {isLoading ? "Yükleniyor..." : JSON.stringify(cloudRecords, null, 2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Aggressive Actions */}
            <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Tehlikeli Bölge
                    </CardTitle>
                    <CardDescription>
                        Sorun çözülmüyorsa bu işlemleri uygulayın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleForceReset}
                    >
                        <Lock className="h-4 w-4" />
                        UYGULAMAYI SIFIRLA VE ÖNBELLEĞİ TEMİZLE
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Bu işlem, telefonunuzdaki tüm hatalı dosyaları siler ve uygulamayı sunucudan taze olarak tekrar indirir.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
