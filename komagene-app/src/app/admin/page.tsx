"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StorageService } from "@/services/storage";
import { SupabaseService } from "@/services/supabase";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { SyncManager } from "@/components/admin/SyncManager";
import { Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminPageContent />
        </AdminGuard>
    );
}

function AdminPageContent() {
    const handleExport = () => {
        StorageService.exportData();
        toast.success("Yedek dosyası indirildi");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (StorageService.importData(content)) {
                toast.success("Veriler başarıyla yüklendi! Sayfa yenileniyor...");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error("Hata: Geçersiz dosya formatı");
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = async () => {
        if (confirm("DİKKAT! Tüm veriler (Bulut dahil) silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            const toastId = toast.loading("Veriler siliniyor...");

            try {
                // Clear Local Storage
                localStorage.clear();

                // Clear Cloud Data
                const { error } = await SupabaseService.clearAllData();
                if (error) throw error;

                toast.success("Tüm veriler başarıyla temizlendi", { id: toastId });
                setTimeout(() => window.location.href = "/", 1000);
            } catch (error: any) {
                console.error("Data clear failed:", error);
                toast.error(`Hata: ${error.message || "Bulut verileri temizlenemedi"}`, { id: toastId });
            }
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">Yönetici Paneli</h1>
                <p className="text-muted-foreground">Sistem ayarları ve veri yönetimi</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cloud Sync Section */}
                <div className="md:col-span-2">
                    <SyncManager />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Veri Yedekleme</CardTitle>
                        <CardDescription>Verilerinizi güvenle saklayın veya başka cihaza taşıyın.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleExport} variant="outline" className="w-full justify-start">
                            <Download className="mr-2 h-4 w-4" />
                            Yedek İndir (JSON)
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Button variant="outline" className="w-full justify-start">
                                <Upload className="mr-2 h-4 w-4" />
                                Yedek Yükle (Import)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="text-red-600">Tehlikeli Bölge</CardTitle>
                        <CardDescription>Bu işlemler geri alınamaz.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleClearData} variant="destructive" className="w-full justify-start">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Tüm Verileri Sıfırla
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
