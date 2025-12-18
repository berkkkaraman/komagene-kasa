"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StorageService } from "@/services/storage";
import { AdminGuard } from "@/components/auth/AdminGuard";
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

    const handleClearData = () => {
        if (confirm("DİKKAT! Tüm veriler silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            localStorage.clear();
            toast.info("Tüm veriler temizlendi");
            setTimeout(() => window.location.href = "/", 1000);
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">Yönetici Paneli</h1>
                <p className="text-muted-foreground">Sistem ayarları ve veri yönetimi</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
