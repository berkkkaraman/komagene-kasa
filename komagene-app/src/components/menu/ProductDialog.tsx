"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Info, Tag, Wallet, UtensilsCrossed } from "lucide-react";

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product;
    onSuccess: () => void;
}

const CATEGORIES = [
    "Çiğ Köfte Dürümler",
    "Porsiyon Çiğ Köfte",
    "Yan Ürünler",
    "Tatlılar",
    "İçecekler",
    "Soslar & Garnitürler",
    "Daha Fazla"
];

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
    const { userProfile } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        price: 0,
        category: CATEGORIES[0],
        is_active: true,
        description: ""
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: "",
                price: 0,
                category: CATEGORIES[0],
                is_active: true,
                description: ""
            });
        }
    }, [product, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.branch_id) {
            toast.error("Şube bilgisi yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya tekrar giriş yapın.");
            console.error("Missing branch_id in userProfile", userProfile);
            return;
        }

        if (!formData.name || (formData.price || 0) <= 0) {
            toast.error("Lütfen ürün adını ve geçerli bir fiyat girin.");
            return;
        }

        setIsLoading(true);
        try {
            await productService.saveProduct({
                ...formData,
                branch_id: userProfile.branch_id
            });
            toast.success(product ? "Ürün güncellendi." : "Ürün başarıyla eklendi.");
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
            toast.error("Kaydetme hatası: " + message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none rounded-[2rem] shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 bg-gradient-to-br from-red-600 to-red-700 text-white relative overflow-hidden">
                        <UtensilsCrossed className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />
                        <DialogTitle className="text-2xl font-black italic tracking-tighter">
                            {product ? "ÜRÜNÜ DÜZENLE" : "YENİ ÜRÜN EKLE"}
                        </DialogTitle>
                        <DialogDescription className="text-red-100 font-medium opacity-80 mt-1 uppercase text-[10px] tracking-widest">
                            {product ? "Mevcut ürün bilgilerini güncelleyin" : "Kataloğunuza yeni bir lezzet katın"}
                        </DialogDescription>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Tag className="h-3 w-3" /> Ürün Adı
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Mega Çiğ Köfte Dürüm"
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-none shadow-inner"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Wallet className="h-3 w-3" /> Fiyat (₺)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={isNaN(formData.price ?? 0) ? "" : formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-none shadow-inner"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-none shadow-inner">
                                            <SelectValue placeholder="Kategori Seç" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Açıklama (Opsiyonel)</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="İçerik bilgisi veya not..."
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-none shadow-inner"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm font-bold uppercase tracking-wider opacity-60">Satışa Açık</span>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(val: boolean) => setFormData({ ...formData, is_active: val })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="h-12 rounded-xl flex-1 font-bold text-xs uppercase"
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 rounded-xl flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 font-bold text-xs uppercase"
                            >
                                {isLoading ? "Kaydediliyor..." : product ? "GÜNCELLE" : "KAYDET"}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
