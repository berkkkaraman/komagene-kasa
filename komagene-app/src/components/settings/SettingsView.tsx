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
        <div className="space-y-10 pb-24 relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

            {/* User Profile Card - Premium Glass */}
            <Card className="border-none glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-10 duration-700">
                <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-rose-600 rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                    <User className="text-white h-12 w-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-display font-black tracking-tighter truncate max-w-[300px]">{user.email}</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500">Doğrulanmış Yönetici</span>
                                    </div>
                                    <div className="h-1 w-1 bg-muted-foreground/30 rounded-full" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">Aktif Oturum</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => signOut()}
                            className="rounded-3xl h-16 px-10 font-display font-black tracking-tight uppercase gap-3 shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/40 active:scale-95 transition-all"
                        >
                            <LogOut className="h-5 w-5" /> Çıkış Yap
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Visual Settings */}
                <Card className="border-none glass-panel rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-left duration-1000">
                    <CardHeader className="p-10 pb-0">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-500/10 rounded-[1.5rem] text-indigo-500 border border-indigo-500/20">
                                <Palette className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight">Görünüm</CardTitle>
                                <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest opacity-60">Arayüz ve Tema Tercihleri</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center justify-between p-6 rounded-[2rem] glass-card border-white/5 group hover:bg-white/5 transition-all">
                            <div className="space-y-1">
                                <Label className="text-base font-display font-black">Karanlık Mod</Label>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-tight text-muted-foreground">Premium gece görünümü</p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setNextTheme(checked ? 'dark' : 'light')}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <div className="space-y-6 p-6 rounded-[2rem] glass-card border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base font-display font-black">Ekran Parlaklığı</Label>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-tight text-muted-foreground">Yazılımsal vardiya ayarı</p>
                                </div>
                                <div className="px-3 py-1 bg-primary/10 rounded-full">
                                    <span className="text-xs font-black text-primary">%{settings.brightness}</span>
                                </div>
                            </div>
                            <Slider
                                defaultValue={[settings.brightness]}
                                max={100}
                                min={40}
                                step={1}
                                onValueChange={(value: number[]) => setBrightness(value[0])}
                                className="py-2"
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">Hızlı Seçim</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'light', label: 'Aydınlık', icon: Sun },
                                    { id: 'dark', label: 'Karanlık', icon: Moon },
                                    { id: 'system', label: 'Sistem', icon: Database }
                                ].map((t) => (
                                    <Button
                                        key={t.id}
                                        variant={theme === t.id ? "default" : "secondary"}
                                        onClick={() => setNextTheme(t.id)}
                                        className={cn(
                                            "h-16 rounded-[1.5rem] font-display font-black uppercase text-[10px] tracking-widest gap-2 flex-col",
                                            theme === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass-card border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <t.icon className="h-4 w-4" />
                                        {t.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-none glass-panel rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-right duration-1000">
                    <CardHeader className="p-10 pb-0">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-amber-500/10 rounded-[1.5rem] text-amber-500 border border-amber-500/20">
                                <Database className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight">Veri & Bulut</CardTitle>
                                <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest opacity-60">Sistem Veri Yönetimi</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <Button
                            variant="outline"
                            className="w-full h-20 rounded-[2rem] justify-between px-8 border-white/10 glass-panel hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-all font-display font-black group"
                            onClick={() => toast.info("Veri paketi hazırlanıyor...")}
                        >
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="uppercase text-xs tracking-widest">JSON Yedeği Al</span>
                                <span className="text-[10px] font-bold opacity-40 lowercase">Tüm sistemi dışa aktarın</span>
                            </div>
                            <Download className="h-7 w-7 group-hover:translate-y-1 transition-transform" />
                        </Button>

                        <div className="relative group overflow-hidden h-20 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                            <Input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />
                            <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                                <span className="text-xs font-display font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">Yedek Dosyası Yükle</span>
                                <span className="text-[9px] font-bold opacity-30 mt-1">.json formatında dosya seçin</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-center gap-3 text-rose-500 uppercase text-[10px] font-display font-black tracking-[0.3em] mb-4">
                                    <AlertTriangle className="h-4 w-4" /> Tehlikeli Alan
                                </div>
                                <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed mb-6">
                                    Bu işlem seçilen tüm verileri kalıcı olarak silecektir. Lütfen işlem yapmadan önce yedeğinizin olduğundan emin olun.
                                </p>
                                <Button
                                    variant="destructive"
                                    className="w-full h-14 rounded-2xl font-display font-black text-xs uppercase bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 shadow-lg shadow-rose-500/10 transition-all duration-300"
                                    onClick={handleClearData}
                                >
                                    Sistem Hafızasını SIFIRLA
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

