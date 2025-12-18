"use client";

import { useState } from "react";
import { InventoryItem, InventoryStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
    "Lavaş (Mega)", "Lavaş (Normal)", "Nar Ekşisi", "Acı Sos", "Islak Mendil",
    "Paket Kağıdı", "Kurye Poşeti", "Turşu (Kova)", "Yeşillik", "Ayran"
];

interface InventoryListProps {
    items: InventoryItem[];
    onUpdate: (items: InventoryItem[]) => void;
}

export function InventoryList({ items, onUpdate }: InventoryListProps) {
    // If no items, initialize with defaults
    const currentItems = items.length > 0 ? items : DEFAULT_ITEMS.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        status: 'ok' as InventoryStatus
    }));

    const updateStatus = (id: string, newStatus: InventoryStatus) => {
        const newItems = currentItems.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        );
        onUpdate(newItems);
    };

    const lowItems = currentItems.filter(i => i.status !== 'ok');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-accent/30 transition-all">
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="flex gap-1">
                            <StatusButton
                                active={item.status === 'ok'}
                                onClick={() => updateStatus(item.id, 'ok')}
                                variant="success"
                                icon={CheckCircle2}
                            />
                            <StatusButton
                                active={item.status === 'low'}
                                onClick={() => updateStatus(item.id, 'low')}
                                variant="warning"
                                icon={AlertCircle}
                            />
                            <StatusButton
                                active={item.status === 'out'}
                                onClick={() => updateStatus(item.id, 'out')}
                                variant="danger"
                                icon={XCircle}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {lowItems.length > 0 && (
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-primary">
                            <ShoppingCart className="h-4 w-4" /> Alışveriş Listesi (Eksikler)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 pb-4">
                        <div className="flex flex-wrap gap-2">
                            {lowItems.map(item => (
                                <Badge
                                    key={item.id}
                                    variant={item.status === 'out' ? "destructive" : "secondary"}
                                    className="px-3 py-1 text-sm font-bold shadow-sm"
                                >
                                    {item.name} {item.status === 'out' ? '(BİTTİ)' : '(Azaldı)'}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatusButton({ active, onClick, variant, icon: Icon }: { active: boolean, onClick: () => void, variant: 'success' | 'warning' | 'danger', icon: any }) {
    const colors = {
        success: active ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-110 z-10" : "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 shadow-sm",
        warning: active ? "bg-orange-500 text-white border-orange-500 shadow-md scale-110 z-10" : "text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 shadow-sm",
        danger: active ? "bg-red-600 text-white border-red-600 shadow-md scale-110 z-10" : "text-red-600 border-red-200 bg-red-50 hover:bg-red-100 shadow-sm",
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className={cn("h-9 w-9 rounded-xl border-2 transition-all active:scale-95", colors[variant])}
            onClick={onClick}
        >
            <Icon className={cn("h-5 w-5", active ? "stroke-[3px]" : "stroke-[2px]")} />
        </Button>
    );
}
