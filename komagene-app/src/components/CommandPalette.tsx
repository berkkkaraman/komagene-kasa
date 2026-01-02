"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, Calculator, Wallet, Receipt, CreditCard, ArrowRight, User, Package, Calendar, Home, Settings, BarChart3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const { addRecord, records } = useStore();
    const [inputValue, setInputValue] = React.useState("");

    // Toggle with Ctrl+K or Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Quick Action Parser
    const parseAction = (input: string) => {
        const lower = input.toLowerCase().trim();
        if (!lower) return null;

        // Regex for "amount [type]" pattern
        // e.g., "1500 nakit", "200 yemeksepeti", "500 gider"
        const amountMatch = lower.match(/^(\d+)\s*([a-zğüşıöç]+)/);

        if (amountMatch) {
            const amount = parseFloat(amountMatch[1]);
            const type = amountMatch[2];

            if (["nakit", "cash"].includes(type)) return { type: "INCOME_CASH", amount };
            if (["kk", "kredi", "kart", "pos"].includes(type)) return { type: "INCOME_POS", amount };
            if (["ys", "yemek", "yemeksepeti"].includes(type)) return { type: "INCOME_YS", amount };
            if (["getir", "gtr"].includes(type)) return { type: "INCOME_GETIR", amount };
            if (["ty", "trendyol", "trend"].includes(type)) return { type: "INCOME_TRENDYOL", amount };
            if (["gelal", "ga", "gel"].includes(type)) return { type: "INCOME_GELAL", amount };
            if (["gider", "harcama"].includes(type)) return { type: "EXPENSE", amount };
        }

        // Veresiye pattern: "ahmet 300 veresiye" or "veresiye ahmet 300"
        if (lower.includes("veresiye")) {
            return { type: "LEDGER_HINT", amount: 0 };
        }

        return null;
    };

    const parsedAction = parseAction(inputValue);

    const executeAction = () => {
        if (!parsedAction) return;

        const today = new Date().toISOString().split('T')[0];
        let record = records.find(r => r.date === today);

        // If no record exists for today, create one
        if (!record) {
            record = {
                id: crypto.randomUUID(),
                branch_id: 'default', // Default branch for single-tenant mode
                date: today,
                income: {
                    cash: 0, creditCard: 0,
                    online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 },
                    source: 'manual'
                },
                expenses: [],
                ledgers: [],
                inventory: [],
                shift: { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                note: "",
                isSynced: false,
                isClosed: false
            };
            addRecord(record);
        }

        const currentRecord = record!;

        if (parsedAction.type.startsWith("INCOME_")) {
            const incomeKey = parsedAction.type.replace("INCOME_", "").toLowerCase();

            let newIncome = { ...currentRecord.income };
            if (incomeKey === "cash") newIncome.cash += parsedAction.amount;
            else if (incomeKey === "pos") newIncome.creditCard += parsedAction.amount;
            else if (incomeKey === "ys") newIncome.online.yemeksepeti += parsedAction.amount;
            else if (incomeKey === "getir") newIncome.online.getir += parsedAction.amount;
            else if (incomeKey === "trendyol") newIncome.online.trendyol += parsedAction.amount;
            else if (incomeKey === "gelal") newIncome.online.gelal += parsedAction.amount;

            useStore.getState().updateRecord({ ...currentRecord, income: newIncome });
            toast.success(`₺${parsedAction.amount} gelir eklendi!`, { description: "Bugünün kaydı güncellendi." });
        } else if (parsedAction.type === "EXPENSE") {
            const newExpense = {
                id: crypto.randomUUID(),
                amount: parsedAction.amount,
                category: 'other' as const,
                description: 'Hızlı Gider (Cmd+K)'
            };
            useStore.getState().updateRecord({ ...currentRecord, expenses: [...currentRecord.expenses, newExpense] });
            toast.info(`₺${parsedAction.amount} gider eklendi.`, { description: "Detayları panelden düzenleyebilirsiniz." });
        }

        setOpen(false);
        setInputValue("");
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[640px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
        >
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4">
                <Search className="w-5 h-5 text-zinc-500 mr-3" />
                <Command.Input
                    value={inputValue}
                    onValueChange={setInputValue}
                    placeholder="Ne yapmak istiyorsun? (Örn: '150 git', '500 nakit')"
                    className="flex-1 h-14 bg-transparent outline-none text-lg font-medium placeholder:text-zinc-400"
                />
                <div className="flex gap-1">
                    <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-600 opacity-100 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
                        ESC
                    </kbd>
                </div>
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    Sonuç bulunamadı.
                </Command.Empty>

                {parsedAction && (
                    <Command.Group heading="Hızlı İşlem">
                        <Command.Item
                            onSelect={executeAction}
                            className="group flex flex-col items-start gap-1 p-3 rounded-xl aria-selected:bg-primary/10 aria-selected:text-primary cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-2 font-bold text-lg">
                                {parsedAction.type.startsWith("INCOME") ? <Plus className="w-5 h-5 text-emerald-500" /> : <ArrowRight className="w-5 h-5 text-rose-500" />}
                                <span>{parsedAction.amount}₺</span>
                                <span className="opacity-50 font-normal text-sm uppercase tracking-wider">
                                    {parsedAction.type === "INCOME_CASH" && "Nakit Gelir Ekle"}
                                    {parsedAction.type === "INCOME_POS" && "Kredi Kartı Gelir Ekle"}
                                    {parsedAction.type === "EXPENSE" && "Hızlı Gider Ekle (Kategorisiz)"}
                                    {parsedAction.type.includes("YS") && "Yemeksepeti Ekle"}
                                    {parsedAction.type.includes("GETIR") && "Getir Ekle"}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground ml-7">
                                Bugünün kaydına anında işlenir.
                            </div>
                        </Command.Item>
                    </Command.Group>
                )}

                <Command.Separator className="my-2 h-px bg-zinc-100 dark:bg-zinc-800/50" />

                <Command.Group heading="Navigasyon">
                    <Command.Item
                        onSelect={() => { router.push("/"); setOpen(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 cursor-pointer"
                    >
                        <Home className="w-5 h-5 opacity-50" />
                        <span className="font-medium">Ana Panel</span>
                    </Command.Item>

                    <Command.Item
                        onSelect={() => { router.push("/reports"); setOpen(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 cursor-pointer"
                    >
                        <BarChart3 className="w-5 h-5 opacity-50" />
                        <span className="font-medium">Arşiv ve Raporlar</span>
                    </Command.Item>

                    <Command.Item
                        onSelect={() => { router.push("/settings"); setOpen(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 cursor-pointer"
                    >
                        <Settings className="w-5 h-5 opacity-50" />
                        <span className="font-medium">Ayarlar</span>
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Kısayollar">
                    <Command.Item
                        onSelect={() => {
                            const today = new Date().toISOString().split('T')[0];
                            router.push(`/?date=${today}`);
                            setOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 cursor-pointer"
                    >
                        <Calendar className="w-5 h-5 opacity-50" />
                        <span className="font-medium">Bugüne Git</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-medium">Günkasa Command</span>
                <div className="flex gap-2 text-[10px] text-zinc-400">
                    <span>Seç: ↵</span>
                    <span>Kapat: ESC</span>
                </div>
            </div>
        </Command.Dialog>
    );
}
