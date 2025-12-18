"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DailyRecord, DailyIncome, ExpenseItem } from "@/types";
import { StorageService } from "@/services/storage";
import { SupabaseService } from "@/services/supabase";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { IncomeForm } from "@/components/dashboard/IncomeForm";
import { ExpenseForm } from "@/components/dashboard/ExpenseForm";
import { ReconcileDialog } from "@/components/dashboard/ReconcileDialog";
import { ZReportCapture } from "@/components/dashboard/ZReportCapture";
import { InventoryList } from "@/components/dashboard/InventoryList";
import { LedgerList } from "@/components/dashboard/LedgerList";
import { ShiftHandoff } from "@/components/dashboard/ShiftHandoff";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, History, Trash2, Plus, ClipboardCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ShiftReport } from "@/types";

export default function Dashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      try {
        const cloudData = await SupabaseService.getRecords();
        if (cloudData.length > 0) {
          setRecords(cloudData);
          StorageService.saveRecords(cloudData); // Sync cloud to local
        } else {
          const localData = StorageService.getRecords();
          setRecords(localData);
        }
      } catch (error) {
        console.error("Cloud fetch failed, using local backup:", error);
        const localData = StorageService.getRecords();
        setRecords(localData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!mounted) return null;

  const dateStr = format(date, "yyyy-MM-dd");

  // Find record for selected date or create mock
  const currentRecord = records.find(r => r.date === dateStr) || {
    id: crypto.randomUUID(),
    date: dateStr,
    income: {
      cash: 0, creditCard: 0,
      mealCard: { sodexo: 0, multinet: 0, setcard: 0 },
      online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 }
    },
    expenses: [],
    inventory: []
  };

  // Calculate Totals
  const calculateIncome = (inc: DailyIncome) => {
    const meal = Object.values(inc.mealCard).reduce((a, b) => a + b, 0);
    const online = Object.values(inc.online).reduce((a, b) => a + b, 0);
    return (inc.cash || 0) + (inc.creditCard || 0) + meal + online;
  };

  const calculateExpense = (exps: ExpenseItem[]) => {
    return exps.reduce((a, b) => a + b.amount, 0);
  };

  const totalIncome = calculateIncome(currentRecord.income);
  const totalExpense = calculateExpense(currentRecord.expenses);

  // Handlers
  const saveRecord = async (updatedRecord: DailyRecord) => {
    // Check if exists
    const existingIndex = records.findIndex(r => r.date === updatedRecord.date);
    let newRecords = [...records];
    if (existingIndex >= 0) {
      newRecords[existingIndex] = updatedRecord;
    } else {
      newRecords.push(updatedRecord);
    }
    setRecords(newRecords);

    // Save to both for reliability
    StorageService.saveRecords(newRecords);
    try {
      await SupabaseService.saveRecord(updatedRecord);
    } catch (error) {
      console.error("Buluta kaydedilemedi:", error);
      toast.error("İnternet bağlantısı sorunu: Veri sadece yerel olarak kaydedildi.");
    }
  };

  const handleIncomeSave = (data: DailyIncome, image?: string) => {
    const updated = { ...currentRecord, income: data, zReportImage: image };
    saveRecord(updated);
    toast.success("Gelir bilgileri güncellendi");
  };

  const handleExpenseAdd = (item: Omit<ExpenseItem, "id">) => {
    const newItem: ExpenseItem = { ...item, id: crypto.randomUUID() };
    const updated = {
      ...currentRecord,
      expenses: [...currentRecord.expenses, newItem]
    };
    saveRecord(updated);
    toast.success("Gider eklendi");
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = {
      ...currentRecord,
      expenses: currentRecord.expenses.filter(e => e.id !== expenseId)
    };
    saveRecord(updated);
    toast.info("Gider silindi");
  };

  const handleInventoryUpdate = (items: any[]) => {
    const updated = { ...currentRecord, inventory: items };
    saveRecord(updated);
    toast.success("Stok durumu güncellendi");
  };

  const handleVeresiyePayment = (amount: number) => {
    const updated = {
      ...currentRecord,
      income: {
        ...currentRecord.income,
        cash: (currentRecord.income.cash || 0) + amount
      }
    };
    saveRecord(updated);
  };

  const handleHandoffComplete = (report: ShiftReport) => {
    const updated = { ...currentRecord, shiftReport: report };
    saveRecord(updated);
    setHandoffOpen(false);
  };

  return (
    <div className="space-y-6 pt-4 pb-20">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Kasa Paneli</h2>
          <p className="text-muted-foreground">Günlük ciro ve gider yönetimi</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih Seç</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats */}
      <StatsCards income={totalIncome} expense={totalExpense} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="income">Gelir</TabsTrigger>
              <TabsTrigger value="expense">Gider</TabsTrigger>
              <TabsTrigger value="inventory">Stok 📦</TabsTrigger>
              <TabsTrigger value="ledger">Veresiye 📒</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Günlük Gelir</CardTitle>
                  <CardDescription>
                    {format(date, "d MMMM yyyy", { locale: tr })} tarihli kasa sayımı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeForm
                    initialData={currentRecord.income}
                    initialImage={currentRecord.zReportImage}
                    onSave={handleIncomeSave}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Harcama & Gider</CardTitle>
                  <CardDescription>Fiş/Fatura girişi yapın</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseForm onAdd={handleExpenseAdd} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stok Durumu</CardTitle>
                  <CardDescription>Biten veya azalan ürünleri işaretleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryList items={currentRecord.inventory || []} onUpdate={handleInventoryUpdate} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ledger" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Veresiye Defteri</CardTitle>
                  <CardDescription>Müşteri borçlarını ve tahsilatları yönetin</CardDescription>
                </CardHeader>
                <CardContent>
                  <LedgerList onPaymentProcessed={handleVeresiyePayment} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Today's Expenses List */}
          {currentRecord.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bugünün Harcamaları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentRecord.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex gap-3 items-start">
                        <div className={`w-2 h-10 rounded-full ${expense.category === 'staff' ? 'bg-blue-500' :
                          expense.category === 'rent' ? 'bg-purple-500' :
                            expense.category === 'supplies' ? 'bg-orange-500' :
                              'bg-gray-500'
                          }`} />
                        <div>
                          <p className="font-medium">{expense.category === 'staff' ? 'Personel' : expense.category === 'supplies' ? 'Malzeme' : expense.tag || expense.category}</p>
                          <p className="text-sm text-muted-foreground">{expense.note || expense.tag || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-600">
                          - {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense.amount)}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Son Hareketler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setReconcileOpen(true)} variant="outline" className="w-full border-dashed border-primary/50 text-primary h-10 text-sm">
                  ⚖️ Kasa Sayımı Yap (Blind Count)
                </Button>
                <Button onClick={() => setHandoffOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 text-sm rounded-lg">
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Vardiya Teslimi
                </Button>
                {records.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(rec => {
                  const recInc = calculateIncome(rec.income);
                  const recExp = calculateExpense(rec.expenses);
                  const net = recInc - recExp;
                  return (
                    <div key={rec.id} className="flex justify-between items-center py-2 border-b last:border-0 cursor-pointer hover:bg-accent/50 p-2 rounded" onClick={() => setDate(new Date(rec.date))}>
                      <div>
                        <p className="font-medium text-sm">{format(new Date(rec.date), "d MMM yyyy", { locale: tr })}</p>
                        <p className="text-xs text-muted-foreground">
                          {rec.expenses.length} gider işlemi
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(net)}
                      </div>
                    </div>
                  );
                })}
                {records.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Henüz kayıt yok.</p>}
              </div>

              {currentRecord && (
                <ReconcileDialog
                  open={reconcileOpen}
                  onOpenChange={setReconcileOpen}
                  record={currentRecord}
                  onSave={(count, diff) => {
                    const updated = { ...currentRecord, cashCount: count, reconciliationDiff: diff };
                    saveRecord(updated);
                    toast.success("Kasa sayımı kaydedildi");
                  }}
                />
              )}

              <Dialog open={handoffOpen} onOpenChange={setHandoffOpen}>
                <DialogContent className="max-w-2xl p-0 border-none bg-transparent shadow-none">
                  {currentRecord && (
                    <ShiftHandoff
                      currentRecord={currentRecord}
                      onComplete={handleHandoffComplete}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
