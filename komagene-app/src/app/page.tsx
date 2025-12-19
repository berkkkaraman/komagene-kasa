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
import { useAuth } from "@/components/auth/AuthProvider";
import { DayClosingDialog } from "@/components/dashboard/DayClosingDialog";
import { DateRibbon } from "@/components/dashboard/DateRibbon";
import { supabase } from "@/lib/supabase";

import { toast } from "sonner";



export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const { records, addRecord, updateRecord } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return null;

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
      {/* Date Navigation & Sync */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-bold border-none bg-transparent hover:bg-accent/50",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {format(date, "d MMMM yyyy", { locale: tr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <SyncButton />
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
