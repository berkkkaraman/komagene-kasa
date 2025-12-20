"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Crown, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardItem {
    branch_name: string;
    total_revenue: number;
    branch_slug: string;
}

export default function LeaguePage() {
    const [rankings, setRankings] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const { data, error } = await supabase.rpc('get_weekly_leaderboard');
            if (error) throw error;
            setRankings(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (index: number) => {
        switch (index) {
            case 0: return "text-yellow-400 drop-shadow-yellow";
            case 1: return "text-slate-300 drop-shadow-slate";
            case 2: return "text-amber-600 drop-shadow-amber";
            default: return "text-slate-600";
        }
    };

    const getBgStyle = (index: number) => {
        if (index === 0) return "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500";
        if (index === 1) return "bg-gradient-to-r from-slate-400/10 to-transparent border-l-4 border-slate-400";
        if (index === 2) return "bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-amber-600";
        return "bg-slate-50/50 dark:bg-slate-900/50";
    };

    return (
        <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                    <Trophy className="h-12 w-12 text-[#D71920]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D71920] to-orange-600">
                    ŞUBELER LİGİ
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                    "Bu Haftanın Şampiyonu Kim?"
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-bold bg-green-100 py-1 px-3 rounded-full w-fit mx-auto">
                    <Sparkles className="h-4 w-4" />
                    Canlı Puan Durumu
                </div>
            </div>

            <Card className="max-w-3xl mx-auto border-none shadow-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Haftalık Ciro Sıralaması (Son 7 Gün)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 animate-pulse text-muted-foreground">Veriler hesaplanıyor...</div>
                    ) : rankings.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">Henüz veri yok. Yarış şimdi başlıyor!</div>
                    ) : (
                        rankings.map((item, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]",
                                    getBgStyle(index)
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("text-3xl font-black w-12 text-center", getMedalColor(index))}>
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {item.branch_name}
                                            {index === 0 && <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-bounce" />}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Günkasa Üyesi</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold font-mono">
                                        {item.total_revenue.toLocaleString('tr-TR')} ₺
                                    </div>
                                    <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                        <TrendingUp className="h-3 w-3" /> Performans
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/20">
                    <Medal className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <h3 className="font-bold">Haftanın Kralı</h3>
                    <p className="text-sm text-muted-foreground">En yüksek ciro yapan şube</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20">
                    <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h3 className="font-bold">Yükselen Yıldız</h3>
                    <p className="text-sm text-muted-foreground">Geçen haftaya göre en çok artış</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20">
                    <Sparkles className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h3 className="font-bold">İstikrar Abidesi</h3>
                    <p className="text-sm text-muted-foreground">Kasa açığını sıfırlayan şube</p>
                </div>
            </div>
        </div>
    );
}
