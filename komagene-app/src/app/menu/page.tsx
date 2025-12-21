"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Search, Utensils, Edit3, Trash2,
    MoreVertical, Tag, Package, ChevronRight,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/menu/ProductDialog";

export default function MenuPage() {
    const { userProfile } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (userProfile?.branch_id) {
            loadProducts();
        }
    }, [userProfile?.branch_id]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productService.fetchProducts(userProfile!.branch_id);
            setProducts(data);
        } catch (error: any) {
            toast.error("Ürünler yüklenemedi: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            await productService.deleteProduct(id);
            toast.success("Ürün silindi.");
            loadProducts();
        } catch (error: any) {
            toast.error("Silme hatası: " + error.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent italic flex items-center gap-3">
                        <Utensils className="text-red-600" />
                        ÜRÜN KATALOĞU
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">
                        Şubenize Ait Menüyü Yönetin
                    </p>
                </div>

                <Button
                    onClick={() => { setSelectedProduct(undefined); setIsDialogOpen(true); }}
                    className="h-12 rounded-2xl gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 px-6 animate-in fade-in slide-in-from-right duration-500"
                >
                    <Plus className="h-5 w-5" />
                    Yeni Ürün Ekle
                </Button>
            </div>

            {/* Controls Area */}
            <Card className="border-none bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-primary/5 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Ürün adı veya kategori ara..."
                            className="pl-12 h-14 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border-none shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Product Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-none bg-white dark:bg-zinc-900 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="p-6 flex flex-col h-full relative">
                                    {/* Category Badge */}
                                    <div className="mb-2 flex items-center gap-2">
                                        <Badge variant="outline" className="rounded-full bg-red-50 text-red-600 border-red-100 flex items-center gap-1 h-6">
                                            <Tag className="h-3 w-3" />
                                            {product.category}
                                        </Badge>
                                        {!product.is_active && (
                                            <Badge variant="secondary" className="rounded-full text-[10px] h-6">Pasif</Badge>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-red-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="text-2xl font-black text-red-600 italic">
                                            {product.price} <span className="text-sm not-italic">₺</span>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                onClick={() => { setSelectedProduct(product); setIsDialogOpen(true); }}
                                            >
                                                <Edit3 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 dark:bg-zinc-900/40 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                        <Package className="h-12 w-12 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold">Ürün Bulunamadı</h3>
                    <p className="text-muted-foreground max-w-xs mt-2 text-sm">
                        Henüz hiç ürün eklememişsiniz veya aramanızla eşleşen ürün yok.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-6 rounded-2xl gap-2 h-12"
                    >
                        <Plus className="h-4 w-4" />
                        İlk Ürünü Ekle
                    </Button>
                </div>
            )}

            <ProductDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                product={selectedProduct}
                onSuccess={loadProducts}
            />
        </div>
    );
}
