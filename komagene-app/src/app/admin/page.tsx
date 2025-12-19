"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GitBranch, ShoppingCart, Activity, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        branches: 0,
        users: 0,
        records: 0
    });

    useEffect(() => {
        async function fetchStats() {
            // These require the Admin Policies to be active!
            const { count: branchesCount } = await supabase.from('branches').select('*', { count: 'exact', head: true });
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: recordsCount } = await supabase.from('records').select('*', { count: 'exact', head: true });

            setStats({
                branches: branchesCount || 0,
                users: usersCount || 0,
                records: recordsCount || 0
            });
        }
        fetchStats();
    }, []);

    return (
        <div className="container mx-auto pt-8 px-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        Super Admin
                    </h1>
                    <p className="text-muted-foreground">SaaS platform yönetimi ve istatistikleri.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/")}>
                        Panele Dön
                    </Button>
                    <Button onClick={() => router.push("/admin/branches")}>
                        Şube Yönetimi
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Şube</CardTitle>
                        <GitBranch className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.branches}</div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Veri</CardTitle>
                        <Activity className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.records}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-12 border-2 border-dashed border-muted rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                <div className="bg-background p-4 rounded-full shadow-sm">
                    <Activity className="h-8 w-8 opacity-20" />
                </div>
                <h3 className="font-semibold text-lg">Platform Özeti</h3>
                <p className="max-w-[400px]">
                    Burada tüm şubelerin canlı akışı ve detaylı performans analizleri yer alacak.
                </p>
            </div>
        </div>
    );
}
