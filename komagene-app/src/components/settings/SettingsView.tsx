"use client";

import { useStore } from "@/store/useStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Download, Sun, AlertTriangle, User, LogOut, ShieldCheck, Database, Palette, Moon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export function SettingsView() {
    const { setRecords, settings, setBrightness } = useStore();
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
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* User Profile Card - Direct and Clean */}
            <Card className="border-none bg-secondary/30 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border-2 border-primary/20">
                                <User className="text-primary h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter">{user.email}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 opacity-80">Aktif Oturum • Yetkili</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => signOut()}
                            className="rounded-2xl px-8 font-black italic tracking-tighter uppercase gap-2 shadow-lg shadow-red-500/20"
                        >
                            <LogOut className="h-4 w-4" /> Çıkış Yap
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Settings */}
                <Card className="border-none bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                <Palette className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Görünüm</CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Tema ve Arayüz Tercihleri</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-background/40 border border-border/10">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-black italic">Karanlık Mod</Label>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-tight text-muted-foreground">Göz yormayan soft karanlık tema</p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setNextTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                        <div className="space-y-4 p-4 rounded-3xl bg-background/40 border border-border/10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-black italic">Ekran Parlaklığı</Label>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-tight text-muted-foreground">Yazılımsal parlaklık ayarı (Vardiya modu)</p>
                                </div>
                                <span className="text-xs font-black text-primary">%{settings.brightness}</span>
                            </div>
                            <Slider
                                defaultValue={[settings.brightness]}
                                max={100}
                                min={40}
                                step={1}
                                onValueChange={(value: number[]) => setBrightness(value[0])}
                                className="py-4"
                            />
                        </div>

                        <Separator className="bg-border/10" />

                        <div className="grid grid-cols-3 gap-3">
                            {['light', 'dark', 'system'].map((t) => (
                                <Button
                                    key={t}
                                    variant={theme === t ? "default" : "secondary"}
                                    onClick={() => setNextTheme(t)}
                                    className={cn(
                                        "h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest",
                                        theme === t ? "bg-primary text-white" : "bg-background/20"
                                    )}
                                >
                                    {t === 'light' ? 'Aydınlık' : t === 'dark' ? 'Karanlık' : 'Sistem'}
                                </Button>
                            ))}
                        </div>

                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-none bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Veri & Yedekleme</CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Sistem verilerini yönetin</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl justify-between border-border/10 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all font-black"
                            onClick={() => toast.info("Veriler Hazırlanıyor...")}
                        >
                            <span className="uppercase text-xs tracking-widest">JSON Yedeği Oluştur</span>
                            <Download className="h-5 w-5" />
                        </Button>

                        <div className="relative group overflow-hidden h-14 rounded-2xl border-2 border-dashed border-border/10 flex items-center justify-center hover:border-primary/50 transition-colors">
                            <Input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Yedek Dosyası Yükle</span>
                        </div>

                        <Separator className="bg-border/10 my-4" />

                        <div className="p-4 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-red-500/60 uppercase text-[9px] font-black tracking-[0.2em]">
                                <AlertTriangle className="h-3 w-3" /> Tehlikeli Bölge
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-2xl font-black italic text-xs uppercase bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20"
                                onClick={handleClearData}
                            >
                                Tüm Hafızayı Sıfırla
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

