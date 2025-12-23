"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { supabase } from "@/lib/supabase";
import { Branch } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Building2, Palette, MessageSquare, Loader2, Image as ImageIcon } from "lucide-react";

const SECTORS = [
    { id: 'restaurant', label: 'Restoran' },
    { id: 'cafe', label: 'Kafe' },
    { id: 'market', label: 'Market' },
    { id: 'bakery', label: 'Fırın / Pastane' },
    { id: 'other', label: 'Diğer' },
];

const COLOR_PRESETS = [
    { name: 'Kırmızı', value: '#D71920' },
    { name: 'Mavi', value: '#3B82F6' },
    { name: 'Yeşil', value: '#10B981' },
    { name: 'Turuncu', value: '#F59E0B' },
    { name: 'Mor', value: '#8B5CF6' },
    { name: 'Pembe', value: '#EC4899' },
];

export default function BusinessSettingsPage() {
    const { userProfile } = useStore();
    const { setBranch } = useBusinessStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Branch>>({
        name: '',
        tagline: '',
        phone: '',
        address: '',
        sector: 'restaurant',
        primary_color: '#D71920',
        ticker_message: '',
        logo_url: ''
    });

    useEffect(() => {
        const fetchBranch = async () => {
            if (!userProfile?.branch_id) return;

            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .eq('id', userProfile.branch_id)
                .single();

            if (error) {
                toast.error("İşletme bilgileri yüklenemedi");
                console.error(error);
            } else if (data) {
                setFormData(data);
                setBranch(data as Branch);
            }
            setIsLoading(false);
        };

        fetchBranch();
    }, [userProfile?.branch_id, setBranch]);

    const handleSave = async () => {
        if (!userProfile?.branch_id) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('branches')
                .update({
                    name: formData.name,
                    tagline: formData.tagline,
                    phone: formData.phone,
                    address: formData.address,
                    sector: formData.sector,
                    primary_color: formData.primary_color,
                    ticker_message: formData.ticker_message,
                    logo_url: formData.logo_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userProfile.branch_id);

            if (error) throw error;

            toast.success("İşletme bilgileri güncellendi! 🎉");

            // Update local store
            if (formData.id) {
                setBranch(formData as Branch);
            }
        } catch (error: any) {
            toast.error("Kaydetme hatası: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter">İşletme Ayarları</h1>
                <p className="text-muted-foreground text-sm">İşletmenizin görünümünü ve bilgilerini özelleştirin</p>
            </div>

            {/* Basic Info */}
            <Card className="border-none shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                        Temel Bilgiler
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>İşletme Adı</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Lezzet Durağı"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slogan / Tagline</Label>
                            <Input
                                value={formData.tagline || ''}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                placeholder="Örn: Lezzet & Hız"
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Telefon</Label>
                            <Input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="0532 123 45 67"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sektör</Label>
                            <Select
                                value={formData.sector}
                                onValueChange={(val) => setFormData({ ...formData, sector: val as any })}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTORS.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Adres</Label>
                        <Input
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Şube adresi"
                            className="h-11 rounded-xl"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="border-none shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="w-5 h-5 text-primary" />
                        Marka Kimliği
                    </CardTitle>
                    <CardDescription>
                        Dijital menü ve POS ekranlarında görünecek renk ve logo
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Ana Renk</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, primary_color: color.value })}
                                    className={`w-10 h-10 rounded-xl border-2 transition-all ${formData.primary_color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                            <Input
                                type="color"
                                value={formData.primary_color || '#D71920'}
                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                className="w-10 h-10 p-1 rounded-xl cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Logo URL (Opsiyonel)
                        </Label>
                        <Input
                            value={formData.logo_url || ''}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            placeholder="https://example.com/logo.png"
                            className="h-11 rounded-xl"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Ticker Message */}
            <Card className="border-none shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Kayan Yazı (Ticker)
                    </CardTitle>
                    <CardDescription>
                        Dijital menü ekranının altında kayan mesaj
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={formData.ticker_message || ''}
                        onChange={(e) => setFormData({ ...formData, ticker_message: e.target.value })}
                        placeholder="Örn: Kampanya! Bugün tüm dürümler %20 indirimli!"
                        className="h-11 rounded-xl"
                    />
                </CardContent>
            </Card>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl font-bold text-lg gap-2 shadow-xl shadow-primary/20"
            >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
        </div>
    );
}
