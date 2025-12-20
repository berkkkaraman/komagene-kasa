"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { ProductService } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MonitorPlay, Eye, EyeOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function ProductsPage() {
    const { userProfile } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Dürüm",
        description: "",
    });

    useEffect(() => {
        if (userProfile?.branch_id) {
            loadProducts();
        }
    }, [userProfile?.branch_id]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await ProductService.getProducts(userProfile!.branch_id);
            setProducts(data);
        } catch (e) {
            toast.error("Ürünler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price) {
            toast.error("İsim ve fiyat zorunludur");
            return;
        }

        try {
            const productData = {
                name: formData.name,
                price: colPrice(formData.price),
                category: formData.category,
                description: formData.description,
                branch_id: userProfile!.branch_id,
                is_active: true
            };

            if (editingProduct) {
                await ProductService.updateProduct(editingProduct.id, productData);
                toast.success("Ürün güncellendi");
            } else {
                await ProductService.createProduct(productData);
                toast.success("Ürün eklendi");
            }

            setIsDialogOpen(false);
            setEditingProduct(null);
            setFormData({ name: "", price: "", category: "Dürüm", description: "" });
            loadProducts();
        } catch (e) {
            toast.error("İşlem başarısız");
        }
    };

    const colPrice = (val: string) => parseFloat(val.replace(',', '.'));

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            await ProductService.deleteProduct(id);
            toast.success("Ürün silindi");
            loadProducts();
        } catch (e) {
            toast.error("Silme başarısız");
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await ProductService.updateProduct(product.id, { is_active: !product.is_active });
            // Optimistic update
            setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
        } catch (e) {
            toast.error("Güncelleme başarısız");
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            description: product.description || ""
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
                    <p className="text-muted-foreground">Dijital menüde görünecek ürünleri buradan yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/signage/${userProfile?.branch_id}`} target="_blank">
                        <Button variant="secondary" className="gap-2">
                            <MonitorPlay className="h-4 w-4" />
                            TV Ekranını Aç
                        </Button>
                    </Link>
                    <Button onClick={() => { setEditingProduct(null); setFormData({ name: "", price: "", category: "Dürüm", description: "" }); setIsDialogOpen(true); }} className="gap-2 bg-gradient-to-r from-red-600 to-red-500">
                        <Plus className="h-4 w-4" />
                        Yeni Ürün
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <Card key={product.id} className={`transition-all hover:shadow-md ${!product.is_active ? 'opacity-60 grayscale' : ''}`}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <Badge variant="outline" className="mb-2">{product.category}</Badge>
                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                <CardDescription>{product.description}</CardDescription>
                            </div>
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                {product.price}₺
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(product)}>
                                    {product.is_active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                                    <Edit2 className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
                        <DialogDescription>
                            Menüde görünecek ürün bilgilerini giriniz.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Ürün Adı</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Mega Dürüm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Fiyat (TL)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="120"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kategori</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dürüm">Dürüm</SelectItem>
                                        <SelectItem value="Porsiyon">Porsiyon</SelectItem>
                                        <SelectItem value="Taco">Taco</SelectItem>
                                        <SelectItem value="İçecek">İçecek</SelectItem>
                                        <SelectItem value="Tatlı">Tatlı</SelectItem>
                                        <SelectItem value="Ekstra">Ekstra</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Açıklama (İsteğe bağlı)</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Bol nar ekşili..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white">Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
