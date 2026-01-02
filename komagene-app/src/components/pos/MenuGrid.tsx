"use client";

import { usePosStore } from "@/store/usePosStore";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Product } from "@/types";

export function MenuGrid() {
    const { products, addToBasket, categories, activeCategoryId, setActiveCategory, searchQuery } = usePosStore();

    // Mock Categories if empty (TEMPORARY: Needs DB fetch)
    const displayCategories = categories.length > 0 ? categories : [
        { id: '1', name: 'Dürümler', sort_order: 1 },
        { id: '2', name: 'Menüler', sort_order: 2 },
        { id: '3', name: 'İçecekler', sort_order: 3 },
    ];

    // Mock Products if empty (TEMPORARY)
    const displayProducts = products.length > 0 ? products : [
        { id: 'p1', name: 'Mega Dürüm', price: 120, category_id: '1', is_active: true },
        { id: 'p2', name: 'Ultra Dürüm', price: 150, category_id: '1', is_active: true },
        { id: 'p3', name: 'Ayran', price: 20, category_id: '3', is_active: true },
        { id: 'p4', name: 'Öğrenci Menü', price: 110, category_id: '2', is_active: true },
        // Add minimal mocks to visualize
    ];

    const filteredProducts = displayProducts.filter(p => {
        const matchesCategory = activeCategoryId ? p.category_id === activeCategoryId : true;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Categories Bar */}
            <div className="relative">
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                    <div className="flex gap-3 px-1">
                        <Button
                            variant={activeCategoryId === null ? "default" : "outline"}
                            onClick={() => setActiveCategory(null)}
                            className={cn(
                                "rounded-2xl h-12 px-8 font-display font-bold transition-all duration-300",
                                activeCategoryId === null
                                    ? "bg-primary text-white shadow-glow-sm shadow-primary/40 scale-105"
                                    : "glass-card border-white/5 hover:bg-white/10"
                            )}
                        >
                            Tümü
                        </Button>
                        {displayCategories.sort((a, b) => a.sort_order - b.sort_order).map(cat => (
                            <Button
                                key={cat.id}
                                variant={activeCategoryId === cat.id ? "default" : "outline"}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "rounded-2xl h-12 px-8 font-display font-bold transition-all duration-300",
                                    activeCategoryId === cat.id
                                        ? "bg-primary text-white shadow-glow-sm shadow-primary/40 scale-105"
                                        : "glass-card border-white/5 hover:bg-white/10"
                                )}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-h-0">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                    {filteredProducts.map(product => (
                        <Card
                            key={product.id}
                            className="group relative cursor-pointer overflow-hidden border-none glass-card hover-lift hover-glow transition-all duration-500 rounded-3xl"
                            onClick={() => addToBasket(product as Product)}
                        >
                            <div className="aspect-[5/4] bg-muted/30 relative overflow-hidden">
                                {/* Decor background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent group-hover:scale-110 transition-transform duration-700" />

                                {/* Image placeholder / Emoji */}
                                <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-bounce-out select-none">
                                    {getEmojiForCategory(product.category_id || '')}
                                </div>

                                {/* Hot Label (Optional/Simulated) */}
                                {product.price > 100 && (
                                    <Badge className="absolute top-3 left-3 bg-primary/90 text-[10px] font-black uppercase tracking-tighter animate-pulse">
                                        Favori
                                    </Badge>
                                )}

                                <Button
                                    size="icon"
                                    className="absolute bottom-4 right-4 h-10 w-10 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-primary/90 hover:bg-primary"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <CardContent className="p-5 space-y-1">
                                <h3 className="font-display font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black font-display tracking-tight text-gradient-gold">
                                        {product.price}
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground">₺</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getEmojiForCategory(catId: string) {
    if (catId === '1') return "🌯";
    if (catId === '2') return "🍱";
    if (catId === '3') return "🥤";
    return "🥡";
}
