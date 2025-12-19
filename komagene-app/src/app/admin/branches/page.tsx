"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Building2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Branch {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export default function BranchesPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New Branch State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const fetchBranches = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setBranches(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleCreate = async () => {
        if (!name || !slug) return;

        try {
            const { error } = await supabase.from('branches').insert([
                { name, slug: slug.toLowerCase().replace(/\s+/g, '-') }
            ]);

            if (error) throw error;

            toast.success("Şube oluşturuldu!");
            setOpen(false);
            setName("");
            setSlug("");
            fetchBranches();
        } catch (e) {
            toast.error("Şube oluşturulamadı. Slug benzersiz olmalı.");
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto pt-8 px-4 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Şube Yönetimi</h1>
                        <p className="text-muted-foreground">Aktif şubeleri görüntüle ve yenilerini oluştur.</p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Yeni Şube Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Şube Oluştur</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Şube Adı</Label>
                                <Input
                                    placeholder="Örn: Pendik Sahil"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        // Auto-generate slug
                                        setSlug(e.target.value.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Kısaltması (Slug)</Label>
                                <Input
                                    placeholder="pendik-sahil"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">Benzersiz olmalıdır.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Oluştur</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <Card key={branch.id} className="group hover:border-indigo-200 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-indigo-500" />
                                    {branch.name}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs">
                                    ID: {branch.slug}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{new Date(branch.created_at).toLocaleDateString('tr-TR')} tarihinde açıldı</span>
                            </div>

                            <div className="mt-4 flex gap-2 w-full">
                                <Button variant="outline" className="w-full text-xs" disabled>
                                    Detay Yönetimi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
