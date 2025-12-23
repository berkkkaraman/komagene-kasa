"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";
import { Trash2, Plus, Save, X, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MenuManagerProps {
    branchId: string;
    products: Product[];
    onRefresh: () => void;
    onClose: () => void;
}

export function MenuManager({ branchId, products, onRefresh, onClose }: MenuManagerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct?.name || !editingProduct?.price) return;

        setIsSaving(true);
        try {
            const productData = {
                ...editingProduct,
                branch_id: branchId,
                is_active: true,
                price: Number(editingProduct.price)
            };

            if (editingProduct.id) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);
                if (error) throw error;
                toast.success("Ürün güncellendi");
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
                toast.success("Yeni ürün eklendi");
            }

            setEditingProduct(null);
            onRefresh();
        } catch (error: any) {
            toast.error("Hata: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success("Ürün silindi");
            onRefresh();
        } catch (error: any) {
            toast.error("Hata: " + error.message);
        }
    };

    return (
        <Card className="border-none bg-background/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="p-8 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Menü Yönetimi</h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Ürünleri ekle, sil veya güncelle</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary/20">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <CardContent className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Add/Edit Form */}
                <form onSubmit={handleSave} className="bg-secondary/20 p-8 rounded-[2rem] border border-border/10 space-y-6">
                    <h3 className="font-black italic uppercase text-lg tracking-tight">
                        {editingProduct?.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Ürün Adı</Label>
                            <Input
                                value={editingProduct?.name || ""}
                                onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                                className="h-12 rounded-xl font-bold bg-background/50"
                                placeholder="Örn: Mega Dürüm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Fiyat (TL)</Label>
                            <Input
                                type="number"
                                value={editingProduct?.price || ""}
                                onChange={e => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="h-12 rounded-xl font-bold bg-background/50"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Kategori</Label>
                            <Input
                                value={editingProduct?.category_id || ""}
                                onChange={e => setEditingProduct(prev => ({ ...prev, category_id: e.target.value }))}
                                className="h-12 rounded-xl font-bold bg-background/50"
                                placeholder="Örn: Dürümler"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-black italic px-8 h-12 rounded-xl gap-2">
                            <Save className="w-4 h-4" /> {editingProduct?.id ? "GÜNCELLE" : "EKLE"}
                        </Button>
                        {editingProduct && (
                            <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)} className="h-12 rounded-xl font-bold italic">
                                VAZGEÇ
                            </Button>
                        )}
                    </div>
                </form>

                {/* Products List */}
                <div className="space-y-4">
                    <h3 className="font-black italic uppercase text-lg tracking-tight px-2">Kayıtlı Ürünler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-6 bg-background/40 border border-border/10 rounded-2xl group hover:border-primary/30 transition-all">
                                <div>
                                    <div className="font-black italic uppercase text-lg tracking-tight">{product.name}</div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase flex gap-2">
                                        <span>{product.category_id}</span>
                                        <span>•</span>
                                        <span className="text-primary">₺{product.price}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} className="hover:bg-primary/10 hover:text-primary rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="hover:bg-red-500/10 hover:text-red-500 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
