"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useStore } from "@/store/useStore";
import { DailyRecord } from "@/types";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CompactForm } from "@/components/dashboard/CompactForm";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, History, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SyncButton } from "@/components/SyncButton";
import { AnomalyAlerts } from "@/components/dashboard/AnomalyAlerts";
import { useAuth } from "@/components/auth/AuthProvider";
import { DayClosingDialog } from "@/components/dashboard/DayClosingDialog";
import { DateRibbon } from "@/components/dashboard/DateRibbon";
import { supabase } from "@/lib/supabase";

import { toast } from "sonner";



const AUTHORIZED_EMAILS = [
  "berkkkaraman@gmail.com",
  "berkaykrmn3@gmail.com",
  "bunyaminserttas828@gmail.com",
  "halatmuhammetalper@gmail.com"
]; // Yetkili e-postalar listesi

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const { records, addRecord, updateRecord } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return null;

  // Giriş yapılmamışsa giriş ekranını göster
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Lütfen Giriş Yapın</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Şube verilerini yönetmek için Google hesabınızla giriş yapmanız gerekmektedir.
        </p>
        <Button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          className="gap-2"
        >
          Google ile Giriş Yap
        </Button>
      </div>
    );
  }

  // Yetkisiz giriş kontrolü
  const isAuthorized = AUTHORIZED_EMAILS.includes(user.email || "");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Başarıyla çıkış yapıldı.");
      // Force reload to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error("Çıkış hatası:", error);
      toast.error("Çıkış yapılırken bir hata oluştu. Tekrar deneyin.");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Erişim Engellendi</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Bu hesaba (`{user.email}`) sistem erişim yetkisi verilmemiştir. Lütfen yetkili bir hesapla tekrar deneyin.
        </p>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          Güvenli Çıkış Yap
        </Button>
      </div>
    );
  }


  const dateStr = format(date, "yyyy-MM-dd");
  const currentRecord: DailyRecord = records.find(r => r.date === dateStr) || {
    id: crypto.randomUUID(),
    date: dateStr,
    income: {
      cash: 0, creditCard: 0,
      online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 }
    },
    expenses: [],
    ledgers: [],
    inventory: [],
    shift: { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
    note: "",
    isSynced: false,
    isClosed: false
  };



  const handleSave = (record: any) => {
    const exists = records.some(r => r.date === record.date);
    if (exists) {
      updateRecord(record);
    } else {
      addRecord(record);
    }
  };


  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Anomaly Alerts (Sentinel) */}
      <AnomalyAlerts />

      {/* Date Navigation & Sync */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-3 rounded-[2rem] border border-primary/5 shadow-2xl overflow-hidden relative">
        {/* Decorator Gradient */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

        {/* Left: Quick Actions / Status */}
        <div className="flex items-center gap-3 pl-4 z-10">
          <SyncButton />
          <div className="h-10 w-px bg-primary/10 hidden md:block" />
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Bulut Durumu</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Eşitleme Aktif</span>
          </div>
        </div>

        {/* Center: Main Date Navigator (The "Floating" Pill) */}
        <div className="flex items-center justify-center z-10">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md rounded-2xl p-1.5 border border-primary/10 shadow-lg group hover:border-primary/30 transition-all duration-500">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "min-w-[200px] justify-center text-center font-black text-xl tracking-tighter hover:bg-transparent px-4 group-hover:text-primary transition-colors",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-primary animate-pulse" />
                  {format(date, "d MMMM yyyy", { locale: tr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-[0_20px_50px_rgba(215,25,32,0.15)] rounded-3xl overflow-hidden" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Right: Closing Actions */}
        <div className="flex items-center justify-end gap-3 pr-4 z-10">
          <div className="h-10 w-px bg-primary/10 hidden md:block mx-2" />
          <DayClosingDialog record={currentRecord} onConfirm={handleSave} />
        </div>
      </div>

      <DateRibbon selectedDate={date} onDateSelect={setDate} />

      {currentRecord.isClosed && (

        <div className="bg-slate-500/10 border-2 border-dashed border-slate-300 p-4 rounded-xl flex items-center justify-center gap-3 text-slate-600 animate-in fade-in zoom-in duration-500">
          <Lock className="h-6 w-6" />
          <span className="font-black italic tracking-wider uppercase">BU GÜN KAPATILDI VE VERİLER KİLİTLENDİ</span>
        </div>
      )}

      {/* KPIs */}
      <SummaryCards record={currentRecord} />

      {/* Data Entry Form in Accordion */}
      <Accordion type="single" collapsible defaultValue="entry" className="w-full">
        <AccordionItem value="entry" className="border-none bg-card/50 backdrop-blur-sm rounded-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <History className="h-5 w-5" />
              <span>Veri Girişi / Detaylar</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <CompactForm
              key={currentRecord.date}
              initialData={currentRecord}
              onSave={handleSave}
              disabled={currentRecord.isClosed}
            />
          </AccordionContent>

        </AccordionItem>
      </Accordion>

      {/* Quick View or other sections can go here */}
    </div>
  );
}
