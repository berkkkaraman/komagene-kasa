"use client";

import { useStore } from "@/store/useStore";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Download, Sun, AlertTriangle, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

export function SettingsView() {
    const { setRecords } = useStore();
    const { theme, setTheme: setNextTheme } = useTheme();
    const { user, signOut } = useAuth();

    const handleClearData = () => {
        if (confirm("Tüm verileriniz kalıcı olarak silinecek. Emin misiniz?")) {
            setRecords([]);
            toast.success("Tüm veriler temizlendi.");
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = JSON.parse(event.target?.result as string);
                    if (Array.isArray(content)) {
                        setRecords(content);
                        toast.success("Veriler başarıyla yüklendi.");
                    } else {
                        throw new Error("Geçersiz format");
                    }
                } catch (err) {
                    toast.error("Dosya okunurken hata oluştu!");
                }
            };
            reader.readAsText(file);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md border-none shadow-md bg-card/50 text-center p-8">
                    <p className="text-muted-foreground">Ayarları yönetmek için giriş yapmalısınız.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Kullanıcı Profili */}
            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="text-primary h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{user.email}</CardTitle>
                        <CardDescription>Aktif Oturum</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-red-500 gap-2">
                        <LogOut className="h-4 w-4" /> Çıkış Yap
                    </Button>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Görünüm Ayarları */}
                <Card className="border-none shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <Sun className="h-4 w-4" /> Görünüm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                            <Label>Aydınlık Mod</Label>
                            <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setNextTheme('light')}>Seç</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                            <Label>Karanlık Mod</Label>
                            <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setNextTheme('dark')}>Seç</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                            <Label>Sistem</Label>
                            <Button variant={theme === 'system' ? 'default' : 'ghost'} size="sm" onClick={() => setNextTheme('system')}>Seç</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Veri Yönetimi */}
                <Card className="border-none shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" /> Veri Yönetimi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Dışa Aktar</Label>
                            <p className="text-xs text-muted-foreground mb-2">Tüm verilerinizi JSON formatında yedekleyin.</p>
                            <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Dosya indiriliyor...")}>
                                <Download className="h-4 w-4" /> JSON Yedek İndir
                            </Button>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label>Geri Yükle</Label>
                            <p className="text-xs text-muted-foreground mb-2">Daha önce aldığınız yedek dosyasını yükleyin.</p>
                            <div className="flex items-center gap-2">
                                <Input type="file" accept=".json" onChange={handleImport} className="text-xs" />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label className="text-red-500">Tehlikeli Bölge</Label>
                            <Button variant="destructive" className="w-full gap-2" onClick={handleClearData}>
                                <Trash2 className="h-4 w-4" /> Tüm Verileri Temizle
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

